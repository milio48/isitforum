<?php
date_default_timezone_set('Asia/Jakarta');
header("Cache-Control: no-store");
header('Content-Type: application/json');


require_once "config.php";
require_once "jwt.php";
require_once "SleekDB/Store.php";
require_once "database-setup.php";


function sendSSE($data) {
    echo "data: " . json_encode($data) . "\n\n";
    // ob_flush();
    // flush();
}

$postData = json_decode(file_get_contents('php://input'), true);
$last = @$postData['time'];
$headers = getallheaders();
$output = [];


if(isset($headers['Authorization'])){
    $bearer = explode(" ", $headers['Authorization']);
    if(count($bearer) == 2 && $bearer[0] === 'Bearer') {
        $token = $bearer[1];
        if(verifyJWT($token, $config['private_key'])){
            $verifiedPayload = verifyJWT($token, $config['private_key']);

            $allActivity = $activityStore->findby(["created_at", ">", $last], ['created_at' => 'asc']);
            if (!empty($allActivity)) {
                $output['all'] = $allActivity;
                $newRooms = $roomStore->findBy([["created_at", ">", $last],  ['userid', '!=', $verifiedPayload['userid']]], ['created_at' => 'asc']);
                if (!empty($newRooms)) {
                    $output['room'] = $newRooms;
                }
            
                $newPosts = $postStore->findBy([["created_at", ">", $last],  ['userid', '!=', $verifiedPayload['userid']]], ['created_at' => 'asc']);
                if (!empty($newPosts)) {
                    $output['post'] = $newPosts;
                }
            
                $newComments = $commentStore->findBy([["created_at", ">", $last],  ['userid', '!=', $verifiedPayload['userid']]], ['created_at' => 'asc']);
                if (!empty($newComments)) {
                    $output['comment'] = $newComments;
                }
            
                $newReplies = $replyStore->findBy([["created_at", ">", $last],  ['userid', '!=', $verifiedPayload['userid']]], ['created_at' => 'asc']);
                if (!empty($newReplies)) {
                    $output['reply'] = $newReplies;
                }
            
            
                $editedPosts = $postStore->findBy([["edited_at", ">", $last],  ['userid', '!=', $verifiedPayload['userid']]], ['edited_at' => 'asc']);
                if (!empty($editedPosts)) {
                    $output['editedPost'] = $editedPosts;
                }
            
                $newActivities = $activityStore->findBy([["created_at", ">", $last],  ['point', '=', 'user']], ['created_at' => 'asc']);
                if (!empty($newActivities)) {
                    $output['user'] = $newActivities;
                }

                
            }
            echo json_encode($output);


        }else{
            echo json_encode(['error'=>['token'=>'Token expired!']]);
            exit;
        }
    }else{
        echo json_encode(['error'=>['token'=>'Token invalid!']]);
        exit;
    }
}


