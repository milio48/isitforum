<?php
require_once "config.php";
require_once "jwt.php";
require_once "database-setup.php";
$uploadDir = $config['folder_upload'];
$headers = getallheaders();



if(isset($headers['Authorization'])){
    $bearer = explode(" ", $headers['Authorization']);
    if(count($bearer) == 2 && $bearer[0] === 'Bearer') {
        $token = $bearer[1];
        if(verifyJWT($token, $config['private_key'])){
            $verifiedPayload = verifyJWT($token, $config['private_key']);
        }else{
            echo json_encode(['error'=>['token'=>'Token expired!']]);
            exit;
        }
    }else{
        echo json_encode(['error'=>['token'=>'Token invalid!']]);
        exit;
    }
}else{
    echo json_encode(['error'=>['token'=>'Token Not Found!']]);
    exit;
}


if($config['upload'] == false){
    echo json_encode(['error'=>'Upload Disabled!']);
    exit;
}


if(isset($_FILES['image'])) {
    $errors = array();

    // Informasi file yang diunggah
    $file_name = $_FILES['image']['name'];
    $file_size = $_FILES['image']['size'];
    $file_tmp = $_FILES['image']['tmp_name'];
    $file_type = $_FILES['image']['type'];
    $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

    // Definisikan ekstensi file yang diperbolehkan
    $allowedExtensions = array("jpeg", "jpg", "png");

    // Validasi ekstensi file
    if (!in_array($file_ext, $allowedExtensions)) {
        $errors[] = "Ekstensi file tidak diperbolehkan, silakan pilih file gambar JPEG atau PNG.";
    }

    // Validasi tipe MIME file
    $allowedMimeTypes = array("image/jpeg", "image/jpg", "image/png");
    if (!in_array($file_type, $allowedMimeTypes)) {
        $errors[] = "Tipe file tidak valid, silakan pilih file gambar JPEG atau PNG.";
    }

    // Validasi ukuran file (maksimal 2MB)
    $maxFileSize = 2 * 1024 * 1024; // 2 MB
    if ($file_size > $maxFileSize) {
        $errors[] = "Ukuran file harus lebih kecil dari 2 MB";
    }

    // Jika tidak ada error, pindahkan file ke direktori yang ditentukan
    if (empty($errors)) {
        // Generate nama file yang unik
        $uniqueFileName = uniqid() . '.' . $file_ext;
        $targetFilePath = $uploadDir .'/'. $uniqueFileName;

        // Pindahkan file ke direktori tujuan
        if (move_uploaded_file($file_tmp, $targetFilePath)) {
            // File berhasil diunggah, kembalikan URL gambar
            $imageUrl = $targetFilePath;
            echo json_encode(array('success' => true, 'imageUrl' => $imageUrl));

            // Input keterangan data ke Database
            require_once "database-setup.php";
            $uploadsStore->insert([
                'file_name' => $file_name,
                'unique_filename'=>$uniqueFileName,
                'userid' => $verifiedPayload['userid'],
                'created_at' => getCurrentTimestamp()
            ]);

        } else {
            // Gagal memindahkan file
            $errors[] = "Gagal mengunggah file. Silakan coba lagi.";
            echo json_encode(array('success' => false, 'message' => $errors[0]));
        }
    } else {
        // Terdapat error pada validasi, kirim pesan error ke frontend
        echo json_encode(array('success' => false, 'message' => $errors[0]));
    }
}
?>
