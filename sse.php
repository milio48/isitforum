<?php
date_default_timezone_set('Asia/Jakarta');
header("Cache-Control: no-store");
header("Content-Type: text/event-stream");


require_once "config.php";
require_once "jwt.php";
require_once "SleekDB/Store.php";
require_once "database-setup.php";


function sendSSE($data) {
    echo "data: " . json_encode($data) . "\n\n";
    ob_flush();
    flush();
}

$last = getCurrentTimestamp();
$token = @$_GET['token'];

if(isset($token)){
    if(verifyJWT($token, $config['private_key'])){
        $verifiedPayload = verifyJWT($token, $config['private_key']);
        sendSSE('work');
    }else{
        echo json_encode(['error'=>['token'=>'Token Expired!']]);
        exit;
    }
}else{
    echo json_encode(['error'=>['token'=>'Token Not Found!']]);
    exit;
}



while (true) {

    $newRooms = $roomStore->findBy([["created_at", ">", $last],  ['userid', '!=', $verifiedPayload['userid']]], ['created_at' => 'asc']);
    if (!empty($newRooms)) {
        sendSSE($newRooms);
        $last = getCurrentTimestamp();
    }

    $newPosts = $postStore->findBy([["created_at", ">", $last],  ['userid', '!=', $verifiedPayload['userid']]], ['created_at' => 'asc']);
    if (!empty($newPosts)) {
        sendSSE($newPosts);
        $last = getCurrentTimestamp();
    }

    $newComments = $commentStore->findBy([["created_at", ">", $last],  ['userid', '!=', $verifiedPayload['userid']]], ['created_at' => 'asc']);
    if (!empty($newComments)) {
        sendSSE($newComments);
        $last = getCurrentTimestamp();
    }

    $newReplies = $replyStore->findBy([["created_at", ">", $last],  ['userid', '!=', $verifiedPayload['userid']]], ['created_at' => 'asc']);
    if (!empty($newReplies)) {
        sendSSE($newReplies);
        $last = getCurrentTimestamp();
    }


    $editedPosts = $postStore->findBy([["edited_at", ">", $last],  ['userid', '!=', $verifiedPayload['userid']]], ['edited_at' => 'asc']);
    if (!empty($editedPosts)) {
        sendSSE($editedPosts);
        $last = getCurrentTimestamp();
    }

    $newActivities = $activityStore->findBy([["created_at", ">", $last],  ['point', '=', 'user']], ['created_at' => 'asc']);
    if (!empty($newActivities)) {
        sendSSE($newActivities);
        $last = getCurrentTimestamp();
    }


  if (connection_aborted()) break;

  sleep($config['reload_realtime']);
}
