<?php
require_once "SleekDB/Store.php";

$config_sleekDB = [
    "timeout" => false // deprecated! Set it to false!
];

$userStore = new \SleekDB\Store("user", $config['folder_db'], $config_sleekDB);
$roomStore = new \SleekDB\Store("room", $config['folder_db'], $config_sleekDB);
$postStore = new \SleekDB\Store("post", $config['folder_db'], $config_sleekDB);
$commentStore = new \SleekDB\Store("comment", $config['folder_db'], $config_sleekDB);
$replyStore = new \SleekDB\Store("reply", $config['folder_db'], $config_sleekDB);

// $postIsiStore = new \SleekDB\Store("post", $config['folder_db'], $config_sleekDB);

$pertanyaanUserStore = new \SleekDB\Store("pertanyaan_user", $config['folder_db'], $config_sleekDB);

$uploadsStore = new \SleekDB\Store("uploads", $config['folder_db'], $config_sleekDB);

$activityStore = new \SleekDB\Store("activity", $config['folder_db'], $config_sleekDB);


function getCurrentTimestamp() {
    return time();
}