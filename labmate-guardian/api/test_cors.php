<!DOCTYPE html>
<html>
<head>
    <title>Test Inventory API</title>
</head>
<body>
    <h1>Testing Inventory API</h1>
    <button onclick="testAPI()">Test API Call</button>
    <div id="result"></div>

    <script>
        async function testAPI() {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = 'Testing...';
            
            try {
                const response = await fetch('http://localhost/labmate/labmate-guardian/api/inventory_equipment.php');
                const data = await response.json();
                
                resultDiv.innerHTML = `
                    <h2>Success!</h2>
                    <p>Status: ${response.status}</p>
                    <p>Records: ${data.data ? data.data.length : 0}</p>
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
            } catch (error) {
                resultDiv.innerHTML = `
                    <h2>Error!</h2>
                    <p>${error.message}</p>
                `;
            }
        }
    </script>
</body>
</html>
