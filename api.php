<?php
// error_reporting(0);
header('Content-Type: application/json');
date_default_timezone_set('Asia/Jakarta');

require_once "SleekDB/Store.php";
require_once "config.php";
require_once "jwt.php";
require_once "database-setup.php";


$postData = json_decode(file_get_contents('php://input'), true);
$headers = getallheaders();

// print_r($headers);

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
}


if(!$postData){
    echo json_encode(['error'=>'null data']);
}


if(@$postData['read']=='forum'){
    if($config['public_kode_daftar']){
        echo json_encode([
            'namaForum'=>$config['nama_forum'],
            'realtime'=>$config['realtime'],
            'reloadRealtime'=>$config['reload_realtime'],
            'kodeDaftar'=>$config['kode_daftar'],
            'moderator'=>$config['moderator']
        ]);
    }else{
        echo json_encode([
            'namaForum'=>$config['nama_forum'],
            'reloadRealtime'=>$config['reload_realtime'],
            'realtime'=>$config['realtime'],
            'moderator'=>$config['moderator']
        ]);
    }
}



if(@$postData['read']=='allUser'){
    $allUser = $userStore->findAll(['created_at' => 'asc']);
    echo json_encode($allUser);
}

if(@$postData['read']=='allWarna'){
    echo json_encode($config['warna']);
}

if(@$postData['read']=='allPertanyaan'){
    echo json_encode($config['pertanyaan']);
}


if(@$postData['newUser']){
    $point = $postData['newUser'];

    if($point['kodeDaftar']!==$config['kode_daftar']){
        echo json_encode(['error'=>'kode daftar salah']);
        exit;
    }

    if (!preg_match('/^[a-zA-Z0-9]+$/', $point['newUser'])) {
        echo 'tidak alpha';
        exit;
    }
    if (!is_numeric($point['colorSelect']) && !is_numeric($point['pertanyaanDaftar'])) {
        echo 'harus int';
        exit;
    }
    
    if($userStore->findOneBy(["username", "=", $point['newUser']])==null){
        $createUser = $userStore->insert([
            'username' => $point['newUser'],
            'color'=>$point['colorSelect'],
            'created_at' => getCurrentTimestamp()
        ]);
        // print_r($createUser);

        $createPertanyaan = $pertanyaanUserStore->insert([
            'userid' => $createUser['_id'],
            'pertanyaan'=> $point['pertanyaanDaftar'],
            'jawaban'=> md5($point['jawabanDaftar']),
            'created_at' => getCurrentTimestamp()
        ]);
        echo json_encode($createUser);

        $activityStore->insert([
            'activity' => 'New User',
            'point' => 'user',
            'id'=> $createUser['_id'],
            'userid' => $createUser['_id'],
            'created_at' => getCurrentTimestamp()
        ]);
    }else{
        echo json_encode(['error'=>'user already exist']);
    };
}

if(@$postData['updateUser']){
    $point = $postData['updateUser'];

    if($verifiedPayload){
        if (!is_numeric($point['colorSelectSetting']) && !is_numeric($point['pertanyaanSetting'])) {
            echo 'harus int';
            exit;
        }
    
        // var_dump($verifiedPayload);
        
        if($userStore->findById($verifiedPayload['userid'])){
            $createUser = $userStore->updateById($verifiedPayload['userid'], [
                'color'=>$point['colorSelectSetting']
            ]);
            // print_r($createUser);
    
            $createPertanyaan = $pertanyaanUserStore->updateById($verifiedPayload['userid'],[
                'pertanyaan'=> $point['pertanyaanSetting'],
                'jawaban'=> md5($point['jawabanSetting'])
            ]);

            $userPrint = $userStore->findById($verifiedPayload['userid']);
            $pertanyaanPrint = $pertanyaanUserStore->findOneBy(["userid", "=", $verifiedPayload['userid']]);
            echo json_encode([$userPrint, $pertanyaanPrint]);
    
            $activityStore->insert([
                'activity' => 'Update User',
                'point' => 'user',
                'id'=> $verifiedPayload['username'],
                'userid' => $verifiedPayload['username'],
                'created_at' => getCurrentTimestamp()
            ]);
        }else{
            echo json_encode(['error'=>'user not found']);
        };
    }

}



if(@$postData['login']){
    $point = $postData['login'];
    $pointUser = $userStore->findOneBy(["username", "=", $point['user']]);
    $pointPertanyaan = $pertanyaanUserStore->findOneBy(["userid", "=", $pointUser['_id']]);

    if($pointUser['username']){
        if($pointPertanyaan['userid']){
            if(md5($point['jawabanLogin'])==$pointPertanyaan['jawaban'] && $point['pertanyaanLogin']==$pointPertanyaan['pertanyaan']){

                $payload = [
                    'username'=>$pointUser['username'],
                    'userid'=>$pointUser['_id'],
                    'color'=>$pointUser['color']
                ];

                $jwt = createJWT($payload, $config['private_key']);
                echo json_encode(['token'=>$jwt]);

                $activityStore->insert([
                    'activity' => 'Login',
                    'point' => 'user',
                    'id'=> $payload['userid'],
                    'userid' => $payload['userid'],
                    'created_at' => getCurrentTimestamp()
                ]);
            }else{
                echo json_encode(['error'=>'Jawaban atau pertanyaan salah!']);
            }
        }
    }else{
        echo json_encode(['error'=>'user not found']);
    };
}



if(@$postData['read']=='allRoom'){
    if($verifiedPayload){
        $allRoom = $roomStore->findAll(['created_at' => 'asc']);
        echo json_encode($allRoom);
    }
}

if(@$postData['read']=='allPost'){
    if($verifiedPayload){
        $allPost = $postStore->findAll(['created_at' => 'asc']);
        echo json_encode($allPost);
    }
}

if(@$postData['read']=='allComment'){
    if($verifiedPayload){
        $allComment = $commentStore->findAll(['created_at' => 'asc']);
        echo json_encode($allComment);
    }
}

if(@$postData['read']=='allReply'){
    if($verifiedPayload){
        $allReply = $replyStore->findAll(['created_at' => 'asc']);
        echo json_encode($allReply);
    }
}

if(@$postData['read']=='allActivity'){
    if($verifiedPayload){
        if(isset($_GET['limit'])){
            $allActivity = $activityStore->findAll(['created_at' => 'desc'], $_GET['limit']);
            echo json_encode(array_reverse($allActivity));
        }
    }
}

if(@$postData['read']=='allUploads'){
    if($verifiedPayload){
        $allUploads = $uploadsStore->findAll(['created_at' => 'asc']);
        echo json_encode($allUploads);
    }
}






if(@$postData['newRoom']){
    $point = $postData['newRoom'];
    if($verifiedPayload){
        if($roomStore->findOneBy(["room", "=", $point['room']])==null){
            $newRoom = $roomStore->insert(['room' => $point['room'], 'userid'=>$verifiedPayload['userid'], 'created_at' => getCurrentTimestamp()]);
            echo json_encode($newRoom);

            $activityStore->insert([
                'activity' => 'New Room',
                'point' => 'room',
                'id'=> $newRoom['_id'],
                'userid' => $verifiedPayload['userid'],
                'created_at' => getCurrentTimestamp()
            ]);
        }else{
            echo json_encode(['error'=>'room already exist']);
        };
    }
}

if(@$postData['newPost']){
    $newPost = $postStore->insert(['post' => $postData['newPost'], 'userid'=>$verifiedPayload['userid'], 'created_at' => getCurrentTimestamp()]);
    echo json_encode($newPost);

    $activityStore->insert([
        'activity' => 'New Post',
        'point' => 'post',
        'id'=> $newPost['_id'],
        'userid' => $verifiedPayload['userid'],
        'created_at' => getCurrentTimestamp()
    ]);
}

if(@$postData['newComment']){
    $newComment = $commentStore->insert(['comment' => $postData['newComment'], 'userid'=>$verifiedPayload['userid'], 'created_at' => getCurrentTimestamp()]);
    echo json_encode($newComment);

    $activityStore->insert([
        'activity' => 'New Comment',
        'point' => 'comment',
        'id'=> $newComment['_id'],
        'userid' => $verifiedPayload['userid'],
        'created_at' => getCurrentTimestamp()
    ]);
}

if(@$postData['newReply']){
    $newReply = $replyStore->insert(['reply' => $postData['newReply'], 'userid'=>$verifiedPayload['userid'], 'created_at' => getCurrentTimestamp()]);
    echo json_encode($newReply);

    $activityStore->insert([
        'activity' => 'New Reply',
        'point' => 'reply',
        'id'=> $newReply['_id'],
        'userid' => $verifiedPayload['userid'],
        'created_at' => getCurrentTimestamp()
    ]);
}

if(@$postData['getPost']){
    if($verifiedPayload){
        $post = $postStore->findById($postData['getPost']);
        echo json_encode($post);
    }
}

if(@$postData['editPost']){
    // $post = $postStore->findById($postData['getPost']);
    $editPost = $postStore->updateById($postData['editPost']['postId'], 
    [
        'post.postContent' => $postData['editPost']['postContent'],
        'post.postContentIsi' => $postData['editPost']['postContentIsi'],
        'edited_at' => getCurrentTimestamp()
    ]);
    
    echo json_encode($editPost);

    $activityStore->insert([
        'activity' => 'Edit Post',
        'point' => 'post',
        'id'=> $editPost['_id'],
        'userid' => $verifiedPayload['userid'],
        'created_at' => getCurrentTimestamp()
    ]);
}


if(@$postData['deleteByMod']){
    
    if($verifiedPayload['username'] == $config['moderator']){
        $result = [];
        if($postData['deleteByMod']['point']=='post'){
            $result = $postStore->updateById($postData['deleteByMod']['postid'], 
                        [
                            'post.postContentIsi' => '⛔️ ~Deleted by Moderator~ ⛔️',
                        ]);
        }elseif($postData['deleteByMod']['point']=='comment'){
            $result = $commentStore->updateById($postData['deleteByMod']['commentid'], 
                        [
                            'comment.commentContent' => '⛔️ ~Deleted by Moderator~ ⛔️',
                        ]);
        }elseif($postData['deleteByMod']['point']=='reply'){
            $result = $replyStore->updateById($postData['deleteByMod']['replyid'], 
                        [
                            'reply.replyContent' => '⛔️ ~Deleted by Moderator~ ⛔️',
                        ]);
        }elseif($postData['deleteByMod']['point']=='room'){
            $room = $roomStore->findById($postData['deleteByMod']['roomid']);
            $result = $roomStore->updateById($postData['deleteByMod']['roomid'], 
                        [
                            'room' => '⛔️ '.$room['room'],
                        ]);
        }
        
        echo json_encode($result);
    }
}