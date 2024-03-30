readForum();
function readForum(){
    postData('api.php', { 'read': 'forum' })
                .then(response => {
                    document.getElementById('nama-forum').innerText = response.namaForum;
                    document.getElementById('kode-daftar').value = response.kodeDaftar || '';
                    readAllWarna();

                    realtime = response.realtime;
                    reloadRealtime = response.reloadRealtime;
                })
                .catch(error => {
                    console.error('Failed to post data:', error);
                });
}


function readAllWarna(){
    postData('api.php', { 'read': 'allWarna' })
        .then(response => {
            listWarna = response;
            const colorSelect = document.getElementById('colorSelect');
            const colorSelectSetting = document.getElementById('colorSelectSetting');
    
            response.forEach((item, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.text = item; 
                option.style.backgroundColor = item;
                colorSelect.appendChild(option.cloneNode(true));
                colorSelectSetting.appendChild(option.cloneNode(true));
                // colorSelect.appendChild(option);
            });
            readAllUser();
        })
        .catch(error => {
            console.error('Failed to post data:', error);
        });
}


function readAllUser(id){
    postData('api.php', { 'read': 'allUser' })
    .then(response => {
        listUser = response;
        const userSelect = document.getElementById('user');

        response.forEach(item => {
            const option = document.createElement('option');
            option.value = item.username;
            option.text = item.username;
            option.style.backgroundColor = listWarna[item.color];
            userSelect.appendChild(option);
        });
        if(typeof id =='number'){
            console.log(getAuthor(id));
            return getAuthor(id);
        }else if(id=='stop'){
            return false;
        }else{
            readAllPertanyaan();
        }
    })
    .catch(error => {
        console.error('Failed to post data:', error);
    });
}


function readAllPertanyaan(option){
    postData('api.php', { 'read': 'allPertanyaan' })
        .then(response => {
            listPertanyaan = response;
            const pertanyaanLogin = document.getElementById('pertanyaan-login');
            const pertanyaanDaftar = document.getElementById('pertanyaan-daftar');
            const pertanyaanSetting = document.getElementById('pertanyaan-setting');
                response.forEach((item, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.text = item;
                    pertanyaanLogin.appendChild(option.cloneNode(true));
                    pertanyaanDaftar.appendChild(option.cloneNode(true));
                    pertanyaanSetting.appendChild(option.cloneNode(true));
                });
            cekLogin();
        })
        .catch(error => {
            console.error('Failed to post data:', error);
        });
}


function renderRoom(){
    postData('api.php', { 'read': 'allRoom' }, true)
            .then(response => {
                if(response.error && response.error.token){logout()}
                const rooms = response;

                if(rooms.length == 0){
                    document.getElementById('forum').innerHTML = 'Forum masih kosong. silahkan <a href="#new-room">buat room</a>.';
                }

                rooms.forEach(function(room) {
                    templateRoom(room._id, room.room);
                });
                renderPost();
            })
            .catch(error => {
                console.error('Failed to post data:', error);
            });
}


function renderPost(){
    postData('api.php', { 'read': 'allPost' }, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            const posts = response;

            posts.forEach(function(post) {
                const data = post.post;
                const roomId = data.roomId;
                const postId = post._id;
                const time = post.created_at;
                const postContent= data.postContent;
                const postContentIsi= data.postContentIsi;
                const userid = post.userid;
                const author = getAuthor(userid);

                if(post.edited_at){
                    var editedCheck = post.edited_at;
                }else{var editedCheck = false;}

                templatePost(roomId, postId, postContent, postContentIsi, author.username, author.color, time, editedCheck);
            });
            renderComment();
        })
        .catch(error => {
            console.error('Failed to post data:', error);
        });
}


function renderComment(){
    postData('api.php', { 'read': 'allComment' }, true)
        .then(response => {
                if(response.error && response.error.token){logout()}
                const comments = response;

                comments.forEach(function(comment) {
                    const commentId = comment._id;
                    const time = comment.created_at;
                    const roomId = comment.comment.roomId;
                    const postId = comment.comment.postId;
                    const commentContent = comment.comment.commentContent;
                    const userid = comment.userid;
                    const author = getAuthor(userid);
                    
                    templateComment(roomId, postId, commentId, commentContent, author.username, author.color, time);
                });
                renderReply();
        })
        .catch(error => {
            console.error('Failed to post data:', error);
        });
}


function renderReply(){

    postData('api.php', { 'read': 'allReply' }, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            const replies = response;

            replies.forEach(function(reply) {
                const roomId = reply.reply.roomId;
                const postId = reply.reply.postId;
                const commentId = reply.reply.commentId;
                const replyId = reply._id;
                const time = reply.created_at;
                const replyContent = reply.reply.replyContent;
                const userid = reply.userid;
                const author = getAuthor(userid);
                templateReply(roomId, postId, commentId, replyId, replyContent, author.username, author.color, time);
            });
            renderActivity(40);
        })
        .catch(error => {
            console.error('Failed to post data:', error);
        });
}


function renderActivity(limit=40){
    document.querySelector('#activity-list').innerHTML = '';
    postData(`api.php?limit=${limit}`, { 'read': 'allActivity' }, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            if(response.error){
                alert(response.error);
                return false;
            }else{
                // console.log(response);
                response.forEach(function(activity) {
                    templateNewActivity(activity.activity, activity.point, activity.userid, activity.id, activity.created_at);
                });
                renderUploads();
            }
        })
        .catch(error => {
            console.error('Failed to post data:', error);
            alert('Error');
        });
}


function renderUploads(){
    postData('api.php', { 'read': 'allUploads' }, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            const uploads = response;

            uploads.forEach(function(upload) {
                templateUploads(upload);
            });
        })
        .catch(error => {
            console.error('Failed to post data:', error);
        });
}