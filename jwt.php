<?php

// Fungsi untuk membuat token JWT
function createJWT($payload, $key, $expiration = null) {
    // Header token
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    
    // Waktu sekarang
    $currentTime = time();
    
    // Waktu kadaluarsa token (default 1 minggu)
    $expiration = $expiration ?: $currentTime + 604800;
    
    // Payload token
    $payload = json_encode(array_merge(['exp' => $expiration], $payload));
    
    // Menghasilkan bagian signature token
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $key, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    // Menggabungkan bagian header, payload, dan signature untuk membentuk token JWT
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

// Fungsi untuk memverifikasi token JWT
function verifyJWT($jwt, $key) {
    // Pengecekan apakah token memiliki tiga bagian yang diharapkan
    $jwtParts = explode('.', $jwt);
    if(count($jwtParts) !== 3) {
        return false; // Token tidak valid jika tidak memiliki tiga bagian
    }

    // Membagi token menjadi bagian header, payload, dan signature
    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $jwtParts;
    
    // Mendekode bagian header dan payload dari token
    $header = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlHeader)), true);
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload)), true);
    
    // Menghitung ulang signature dari bagian header dan payload
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $key, true);
    $base64UrlSignatureComputed = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    // Membandingkan signature yang dihitung ulang dengan signature yang ada dalam token
    if ($base64UrlSignature === $base64UrlSignatureComputed) {
        // Memeriksa apakah token kadaluarsa
        if (isset($payload['exp']) && $payload['exp'] >= time()) {
            return $payload; // Token valid
        }
    }
    
    return false; // Token tidak valid
}


// // Key rahasia yang digunakan untuk menandatangani dan memverifikasi token
// $key = "example_key";

// // Data yang ingin dimasukkan ke dalam token
// $payload = array(
//     "user_id" => 1,
//     "username" => "faza"
// );

// // Membuat token JWT
// $jwt = createJWT($payload, $key);

// echo "Token JWT: " . $jwt . "\n";

// // Memverifikasi token JWT
// $verifiedPayload = verifyJWT($jwt, $key);
// if ($verifiedPayload) {
//     echo "Token JWT valid.\n";
//     echo "User ID: " . $verifiedPayload['user_id'] . "\n";
//     echo "Username: " . $verifiedPayload['username'] . "\n";
//     echo "Expired: " . $verifiedPayload['exp'] . "\n";
// } else {
//     echo "Token JWT tidak valid.";
// }

?>