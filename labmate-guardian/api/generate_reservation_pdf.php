<?php
require_once 'db.php';
require_once 'reservations.php';

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="reservation_record.pdf"');

class ReservationPDF extends FPDF {
    function Header() {
        $this->SetFont('Arial', 'B', 12);
        $this->Cell(0, 10, 'Equipment Reservation Record', 0, 1, 'C');
        $this->Ln(10);
    }
    
    function Footer() {
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 10, 'Page ' . $this->PageNo(), 0, 0, 'C');
    }
}

// Create PDF instance
$pdf = new ReservationPDF();
$pdf->AddPage();

// Get reservation data
$reservation_id = $_GET['id'] ?? null;
if (!$reservation_id) {
    die('Reservation ID required');
}

$conn = get_db_connection();
$sql = "SELECT r.*, u.first_name, u.last_name, u.email, ie.name as equipment_name 
         FROM equipment_reservations r 
         LEFT JOIN users u ON r.user_id = u.id 
         LEFT JOIN inventory_equipment ie ON r.equipment_id = ie.id 
         WHERE r.id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $reservation_id);
$stmt->execute();
$result = $stmt->get_result();
$reservation = $result->fetch_assoc();

if (!$reservation) {
    die('Reservation not found');
}

// Set font
$pdf->SetFont('Arial', '', 12);

// Reservation Details
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, 'Reservation Information', 0, 1);
$pdf->SetFont('Arial', '', 12);

$pdf->Cell(50, 8, 'Reservation Number:', 0);
$pdf->Cell(0, 8, $reservation['reservation_number'], 0, 1);
$pdf->Cell(50, 8, 'Status:', 0);
$pdf->Cell(0, 8, ucfirst($reservation['status']), 0, 1);
$pdf->Cell(50, 8, 'Date Created:', 0);
$pdf->Cell(0, 8, date('M j, Y', strtotime($reservation['created_at'])), 0, 1);
$pdf->Ln(10);

// User Information
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, 'User Information', 0, 1);
$pdf->SetFont('Arial', '', 12);

$pdf->Cell(50, 8, 'Name:', 0);
$pdf->Cell(0, 8, trim($reservation['first_name'] . ' ' . $reservation['last_name']), 0, 1);
$pdf->Cell(50, 8, 'User Type:', 0);
$pdf->Cell(0, 8, ucfirst($reservation['user_type']), 0, 1);
$pdf->Cell(50, 8, 'Email:', 0);
$pdf->Cell(0, 8, $reservation['email'], 0, 1);
$pdf->Cell(50, 8, 'Contact Info:', 0);
$pdf->Cell(0, 8, $reservation['contact_info'] ?? 'N/A', 0, 1);
$pdf->Ln(10);

// Equipment Details
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, 'Equipment Details', 0, 1);
$pdf->SetFont('Arial', '', 12);

$pdf->Cell(50, 8, 'Equipment:', 0);
$pdf->Cell(0, 8, $reservation['equipment_name'], 0, 1);
$pdf->Cell(50, 8, 'Quantity:', 0);
$pdf->Cell(0, 8, $reservation['quantity_reserved'], 0, 1);
$pdf->Cell(50, 8, 'Reservation Date:', 0);
$pdf->Cell(0, 8, date('M j, Y', strtotime($reservation['reservation_date'])), 0, 1);
$pdf->Cell(50, 8, 'Start Time:', 0);
$pdf->Cell(0, 8, date('h:i A', strtotime($reservation['start_time'])), 0, 1);
$pdf->Cell(50, 8, 'End Time:', 0);
$pdf->Cell(0, 8, date('h:i A', strtotime($reservation['end_time'])), 0, 1);
$pdf->Ln(10);

// Purpose
if ($reservation['purpose']) {
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->Cell(0, 10, 'Purpose', 0, 1);
    $pdf->SetFont('Arial', '', 12);
    $pdf->MultiCell(0, 8, $reservation['purpose']);
    $pdf->Ln(10);
}

// Penalty Information
if ($reservation['penalty_amount'] > 0) {
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->Cell(0, 10, 'Penalty Information', 0, 1);
    $pdf->SetFont('Arial', '', 12);
    
    $pdf->Cell(50, 8, 'Penalty Amount:', 0);
    $pdf->Cell(0, 8, '$' . number_format($reservation['penalty_amount'], 2), 0, 1);
    $pdf->Cell(50, 8, 'Penalty Paid:', 0);
    $pdf->Cell(0, 8, $reservation['penalty_paid'] ? 'Yes' : 'No', 0, 1);
    $pdf->Ln(10);
}

// Approval Information
if ($reservation['approved_by'] && $reservation['approved_at']) {
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->Cell(0, 10, 'Approval Information', 0, 1);
    $pdf->SetFont('Arial', '', 12);
    
    $pdf->Cell(50, 8, 'Approved At:', 0);
    $pdf->Cell(0, 8, date('M j, Y h:i A', strtotime($reservation['approved_at'])), 0, 1);
    $pdf->Ln(10);
}

// Notes
if ($reservation['notes']) {
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->Cell(0, 10, 'Notes', 0, 1);
    $pdf->SetFont('Arial', '', 12);
    $pdf->MultiCell(0, 8, $reservation['notes']);
}

// Output PDF
$pdf->Output('D', 'reservation_record.pdf');
?>
