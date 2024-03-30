<?php

// Port default
$port = 8000;

if (php_sapi_name() == 'cli') {
    if(isset($argv[1])) {
        $port = (int)$argv[1];
    }

    echo "\n
    ······································
    :░▀█▀░█▀▀░▀█▀░▀█▀░█▀▀░█▀█░█▀▄░█░█░█▄█:
    :░░█░░▀▀█░░█░░░█░░█▀▀░█░█░█▀▄░█░█░█░█:
    :░▀▀▀░▀▀▀░▀▀▀░░▀░░▀░░░▀▀▀░▀░▀░▀▀▀░▀░▀:
    ······································
    isitForum PHP built-in server started at http://localhost:$port\n
    ---------------------------------------------------------------
    \n";
    
    exec("php -S localhost:$port server-builtin.php");

    exit;
}


// Mendapatkan permintaan URL
$request_uri = $_SERVER['REQUEST_URI'];

// Jika permintaan adalah root atau index.html, arahkan ke index.html
if ($request_uri === '/' || $request_uri === '/index.html') {
    $filepath = __DIR__ . '/index.html';
    
    // Baca isi file index.html
    $content = file_get_contents($filepath);
    
    // Sisipkan JavaScript ke dalam file index.html
    $javascript = '<script>console.log("Run isitForum with Built-in PHP")</script>';
    $content = str_replace('</body>', $javascript . '</body>', $content);
    
    // Set header Content-Type ke text/html
    header("Content-Type: text/html");
    
    // Tampilkan isi file dengan JavaScript disisipkan
    echo $content;
    exit; // Menghentikan eksekusi setelah menampilkan konten
} else {
    // Menentukan path file berdasarkan permintaan URL
    $filepath = __DIR__ . $request_uri;
}

// Memeriksa apakah file ada
if (file_exists($filepath) && !is_dir($filepath)) {
    // Mengecek apakah file diizinkan untuk diakses secara langsung
    $allowed_extensions = array("html", "htm", "css", "js", "php", "jpg", "jpeg", "png", "gif");
    $ext = pathinfo($filepath, PATHINFO_EXTENSION);
    if (in_array($ext, $allowed_extensions)) {
        // Melayani file statis yang sesuai
        return false;
    }
}

// Jika permintaan memiliki parameter URL, lewati router dan biarkan server PHP menangani permintaan
if (strpos($request_uri, '?') !== false) {
    return false;
}

// Jika file tidak ditemukan atau merupakan direktori, kembalikan respons 404
http_response_code(404);
echo "Halaman tidak ditemukan";
