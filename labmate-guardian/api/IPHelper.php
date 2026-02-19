<?php
/**
 * IP Helper
 * Handles IP address detection, X-Forwarded-For parsing, and anonymization
 */

class IPHelper {
    
    /**
     * Get the real client IP address
     * Checks X-Forwarded-For header for proxy/load balancer scenarios
     * 
     * @return array ['ip' => string, 'real_ip' => string|null, 'is_proxy' => bool]
     */
    public static function getClientIP() {
        $directIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $realIP = null;
        $isProxy = false;
        
        // Check for X-Forwarded-For header (proxy/load balancer)
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $isProxy = true;
            
            // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
            // The first IP is usually the real client IP
            $forwardedIPs = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $realIP = trim($forwardedIPs[0]);
            
            // Validate IP format
            if (!filter_var($realIP, FILTER_VALIDATE_IP)) {
                $realIP = null;
            }
        }
        
        // Check other proxy headers as fallback
        if (!$realIP && !empty($_SERVER['HTTP_X_REAL_IP'])) {
            $isProxy = true;
            $realIP = $_SERVER['HTTP_X_REAL_IP'];
            
            if (!filter_var($realIP, FILTER_VALIDATE_IP)) {
                $realIP = null;
            }
        }
        
        // Use real IP if available, otherwise use direct IP
        $finalIP = $realIP ?? $directIP;
        
        return [
            'ip' => $finalIP,              // The IP to use for logging
            'real_ip' => $realIP,          // Real IP from X-Forwarded-For (if proxy)
            'direct_ip' => $directIP,      // Direct connection IP
            'is_proxy' => $isProxy         // Whether behind proxy/load balancer
        ];
    }
    
    /**
     * Anonymize IP address for privacy compliance (GDPR/CCPA)
     * Masks the last octet for IPv4, last 80 bits for IPv6
     * 
     * @param string $ip The IP address to anonymize
     * @return string Anonymized IP address
     */
    public static function anonymizeIP($ip) {
        if (empty($ip) || $ip === 'unknown') {
            return $ip;
        }
        
        // IPv4
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            $parts = explode('.', $ip);
            $parts[3] = 'xxx';  // Mask last octet
            return implode('.', $parts);
        }
        
        // IPv6
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            $parts = explode(':', $ip);
            // Mask last 5 groups (80 bits)
            for ($i = 3; $i < count($parts); $i++) {
                $parts[$i] = 'xxxx';
            }
            return implode(':', $parts);
        }
        
        return $ip;
    }
    
    /**
     * Determine if IP should be anonymized based on user role
     * Admins: Keep full IP (audit requirement)
     * Regular users: Anonymize IP (privacy compliance)
     * 
     * @param string $ip The IP address
     * @param string|null $userRole The user's role
     * @return string Full or anonymized IP based on role
     */
    public static function getPrivacyCompliantIP($ip, $userRole = null) {
        // Keep full IP for admins (security/audit requirement)
        if ($userRole === 'admin' || $userRole === 'root_admin') {
            return $ip;
        }
        
        // Anonymize for regular users (GDPR/CCPA compliance)
        return self::anonymizeIP($ip);
    }
    
    /**
     * Check if IP is from a private network
     * 
     * @param string $ip The IP address to check
     * @return bool True if private IP
     */
    public static function isPrivateIP($ip) {
        if (empty($ip) || $ip === 'unknown') {
            return false;
        }
        
        return !filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        );
    }
    
    /**
     * Get IP information summary
     * 
     * @param string $ip The IP address
     * @return array IP information
     */
    public static function getIPInfo($ip) {
        return [
            'ip' => $ip,
            'is_private' => self::isPrivateIP($ip),
            'is_ipv4' => filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false,
            'is_ipv6' => filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) !== false,
            'anonymized' => self::anonymizeIP($ip)
        ];
    }
    
    /**
     * Detect suspicious IP patterns
     * 
     * @param string $ip The IP address
     * @return array ['is_suspicious' => bool, 'reasons' => array]
     */
    public static function detectSuspiciousIP($ip) {
        $reasons = [];
        
        // Check if IP is from Tor network (common exit nodes)
        // This is a simplified check - in production, use a Tor exit node list
        if (self::isPrivateIP($ip)) {
            $reasons[] = 'Private/Internal IP';
        }
        
        // Check for localhost
        if (in_array($ip, ['127.0.0.1', '::1', 'localhost'])) {
            $reasons[] = 'Localhost';
        }
        
        return [
            'is_suspicious' => count($reasons) > 0,
            'reasons' => $reasons
        ];
    }
}

