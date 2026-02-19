<?php
/**
 * User Agent Parser
 * Parses User-Agent strings to extract device, browser, and OS information
 * Lightweight implementation without external dependencies
 */

class UserAgentParser {
    private $userAgent;
    
    public function __construct($userAgent = null) {
        $this->userAgent = $userAgent ?? ($_SERVER['HTTP_USER_AGENT'] ?? '');
    }
    
    /**
     * Parse User-Agent and return all information
     */
    public function parse() {
        return [
            'device_type' => $this->getDeviceType(),
            'browser' => $this->getBrowser(),
            'os' => $this->getOS(),
            'is_bot' => $this->isBot()
        ];
    }
    
    /**
     * Detect device type (mobile, desktop, tablet, bot)
     */
    public function getDeviceType() {
        if ($this->isBot()) {
            return 'bot';
        }
        
        $ua = strtolower($this->userAgent);
        
        // Tablet detection (must come before mobile)
        if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i', $this->userAgent)) {
            return 'tablet';
        }
        
        // Mobile detection
        if (preg_match('/(mobile|iphone|ipod|blackberry|android|windows phone|palm|webos)/i', $this->userAgent)) {
            return 'mobile';
        }
        
        // Desktop (default)
        if (preg_match('/(windows|macintosh|linux|x11)/i', $this->userAgent)) {
            return 'desktop';
        }
        
        return 'unknown';
    }
    
    /**
     * Detect browser name and version
     */
    public function getBrowser() {
        $ua = $this->userAgent;
        
        // Edge (Chromium-based)
        if (preg_match('/Edg\/([0-9.]+)/i', $ua, $matches)) {
            return 'Edge ' . $matches[1];
        }
        
        // Chrome
        if (preg_match('/Chrome\/([0-9.]+)/i', $ua, $matches)) {
            // Exclude Edge and other Chrome-based browsers
            if (!preg_match('/(Edg|OPR)/i', $ua)) {
                return 'Chrome ' . $matches[1];
            }
        }
        
        // Opera
        if (preg_match('/(Opera|OPR)\/([0-9.]+)/i', $ua, $matches)) {
            return 'Opera ' . $matches[2];
        }
        
        // Firefox
        if (preg_match('/Firefox\/([0-9.]+)/i', $ua, $matches)) {
            return 'Firefox ' . $matches[1];
        }
        
        // Safari (must come after Chrome check)
        if (preg_match('/Safari\/([0-9.]+)/i', $ua, $matches)) {
            if (!preg_match('/(Chrome|Chromium|Edg)/i', $ua)) {
                if (preg_match('/Version\/([0-9.]+)/i', $ua, $version)) {
                    return 'Safari ' . $version[1];
                }
                return 'Safari ' . $matches[1];
            }
        }
        
        // Internet Explorer
        if (preg_match('/(MSIE|Trident).*rv:([0-9.]+)/i', $ua, $matches)) {
            return 'IE ' . $matches[2];
        }
        if (preg_match('/MSIE ([0-9.]+)/i', $ua, $matches)) {
            return 'IE ' . $matches[1];
        }
        
        return 'Unknown';
    }
    
    /**
     * Detect operating system
     */
    public function getOS() {
        $ua = $this->userAgent;
        
        // Windows
        if (preg_match('/Windows NT ([0-9.]+)/i', $ua, $matches)) {
            $version = $matches[1];
            $windowsVersions = [
                '10.0' => 'Windows 10/11',
                '6.3' => 'Windows 8.1',
                '6.2' => 'Windows 8',
                '6.1' => 'Windows 7',
                '6.0' => 'Windows Vista',
                '5.1' => 'Windows XP',
            ];
            return $windowsVersions[$version] ?? 'Windows NT ' . $version;
        }
        
        // macOS
        if (preg_match('/Mac OS X ([0-9_]+)/i', $ua, $matches)) {
            $version = str_replace('_', '.', $matches[1]);
            return 'macOS ' . $version;
        }
        
        // iOS
        if (preg_match('/(iPhone|iPad|iPod).*OS ([0-9_]+)/i', $ua, $matches)) {
            $version = str_replace('_', '.', $matches[2]);
            return 'iOS ' . $version;
        }
        
        // Android
        if (preg_match('/Android ([0-9.]+)/i', $ua, $matches)) {
            return 'Android ' . $matches[1];
        }
        
        // Linux
        if (preg_match('/Linux/i', $ua)) {
            if (preg_match('/Ubuntu/i', $ua)) {
                return 'Ubuntu Linux';
            }
            return 'Linux';
        }
        
        // Chrome OS
        if (preg_match('/CrOS/i', $ua)) {
            return 'Chrome OS';
        }
        
        return 'Unknown';
    }
    
    /**
     * Detect if User-Agent is a bot/crawler
     */
    public function isBot() {
        $ua = strtolower($this->userAgent);
        
        // Common bot patterns
        $botPatterns = [
            'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python',
            'java', 'http', 'libwww', 'perl', 'php', 'ruby', 'go-http',
            'slurp', 'bingbot', 'googlebot', 'baiduspider', 'yandexbot',
            'duckduckbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
            'whatsapp', 'telegram', 'slack', 'discord', 'postman', 'insomnia'
        ];
        
        foreach ($botPatterns as $pattern) {
            if (strpos($ua, $pattern) !== false) {
                return true;
            }
        }
        
        // Empty or very short User-Agent (suspicious)
        if (strlen($this->userAgent) < 10) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Get a human-readable summary
     */
    public function getSummary() {
        $parsed = $this->parse();
        
        if ($parsed['is_bot']) {
            return 'Bot/Crawler';
        }
        
        return sprintf(
            '%s - %s on %s',
            ucfirst($parsed['device_type']),
            $parsed['browser'],
            $parsed['os']
        );
    }
}

