
function newUser(){
    var user = document.getElementById('user');
    var newUser = document.getElementById('newUser').value;
    var colorSelect = document.getElementById('colorSelect').value;
    var pertanyaanDaftar = document.getElementById('pertanyaan-daftar').value;
    var jawabanDaftar = document.getElementById('jawaban-daftar').value;
    var kodeDaftar = document.getElementById('kode-daftar').value;

    if (newUser && newUser.trim() !== '' &&
        colorSelect && colorSelect.trim() !== '' &&
        pertanyaanDaftar && pertanyaanDaftar.trim() !== '' &&
        jawabanDaftar && jawabanDaftar.trim() !== '' &&
        kodeDaftar && kodeDaftar.trim() !== ''
        ) {
        console.log('try to register');
    } else {
        alert("Tidak boleh kosong");
        return false;
    }

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(newUser)) {
        alert('Hanya boleh berupa huruf dan angka!');
        return false;
    }
        

    postData('api.php', { 'newUser': { newUser, colorSelect, pertanyaanDaftar, jawabanDaftar, kodeDaftar } })
        .then(response => {
            if(response.error){
                alert(response.error);
                return false;
            }
            user.innerHTML += `<option value="${newUser}" style="background-color: ${listWarna[colorSelect]};">${newUser}</option>`;
            user.value=newUser;
            document.getElementById('new-user').style.display = 'none';
            readAllUser('stop');
        })
        .catch(error => {
            console.error('Failed to post data:', error);
            alert('Error');
        });

}

function updateUser() {
    var colorSelectSetting = document.getElementById('colorSelectSetting').value;
    var pertanyaanSetting = document.getElementById('pertanyaan-setting').value;
    var jawabanSetting = document.getElementById('jawaban-setting').value;

    if (colorSelectSetting && colorSelectSetting.trim() !== '' &&
        pertanyaanSetting && pertanyaanSetting.trim() !== '' &&
        jawabanSetting && jawabanSetting.trim() !== '') {
        console.log('try to register');
    } else {
        alert("Tidak boleh kosong");
        return false;
    }


    postData('api.php', { 'updateUser': {colorSelectSetting, pertanyaanSetting, jawabanSetting} }, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            if(response.error){
                alert(response.error);
                return false;
            }else{
                console.log(response);
            }
        })
        .catch(error => {
            console.error('Failed to post data:', error);
            alert('Error');
        });
}

function login(){
    var user =  document.getElementById('user').value;
    var pertanyaanLogin = document.getElementById('pertanyaan-login').value;
    var jawabanLogin = document.getElementById('jawaban-login').value;
    var payload;

    if (user && user.trim() !== '' &&
        pertanyaanLogin && pertanyaanLogin.trim() !== '' &&
        jawabanLogin && jawabanLogin.trim() !== '') {
        console.log('try to login');
    } else {
        alert("Tidak boleh kosong");
        return false;
    }

    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(user)) {
        alert('Hanya boleh berupa huruf dan angka!');
        return false;
    }

    postData('api.php', { 'login': { user, pertanyaanLogin, jawabanLogin } })
    .then(response => {
        if(!response.error){
            saveTokenToLocalStorage(response.token);
            payload = readPayloadFromJwt();
            userName = payload.username;
            userColor = payload.color;
            userId = payload.userid;
            console.log(`${userName} : ${userColor}`);
        
            document.getElementById('login').style.display = 'none';
            document.getElementById('forum').style.display = '';
            document.getElementById('new-room').style.display = '';
            document.getElementById('setting').style.display = '';
            document.getElementById('userSetting').value = userName;
            document.getElementById('uploads').style.display = '';

            document.querySelector('.header').innerHTML += templateGreetingAndMenu();
            document.querySelector('#activity').style.display='';
        
            renderRoom();

            if(realtime == 'ajax'){
                runAjax(reloadRealtime);
            }else if(realtime == 'sse'){
                runSSE();
            }
        }else{alert(response.error)}
    })
    .catch(error => {
        console.error('Failed to post data:', error);
        alert('Error');
    });
}


// jika sudah ada token
function cekLogin(){
    if(readPayloadFromJwt()){
        document.getElementById('user').value;
        document.getElementById('pertanyaan-login').value;
        document.getElementById('jawaban-login').value;
    
        payload = readPayloadFromJwt();
        userName = payload.username;
        userColor = payload.color;
        userId = payload.userid;
        console.log(`${userName} : ${userColor}`);

        const author = getAuthor(userId);
        if(!author){logout();}
    
        document.getElementById('login').style.display = 'none';
        document.getElementById('forum').style.display = '';
        document.getElementById('new-room').style.display = '';
        document.getElementById('setting').style.display = '';
        document.getElementById('userSetting').value = userName;
        document.getElementById('uploads').style.display = '';
        
        document.querySelector('.header').innerHTML += templateGreetingAndMenu();
        document.querySelector('#activity').style.display='';
    
        renderRoom();
        
        if(realtime == 'ajax'){
            runAjax(reloadRealtime);
        }else if(realtime == 'sse'){
            runSSE();
        }
    }
}

function logout(){
    alert('logout');
    localStorage.removeItem('jwtToken');
    location.reload();
}
    


function buatRoom() {
    const newRoomName = document.getElementById('newRoomName').value.trim();
    if (!newRoomName) {
        alert("Nama room tidak boleh kosong!");
        return;
    }
    const room = newRoomName;

    postData('api.php', { 'newRoom': {room} }, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            if(response.error){
                alert(response.error);
                return false;
            }else{
                const data = response;
                const roomId = data._id;
                const roomName = data.room;

                if(roomId==1){ // jika room pertama, reset pesan room kosong.
                    document.getElementById('forum').innerHTML = '';
                }

                templateRoom(roomId, roomName);
                document.getElementById('newRoomName').value='';
            }
        })
        .catch(error => {
            console.error('Failed to post data:', error);
            alert('Error');
        });
}

function buatPost(buttonElement) {
    const parent = buttonElement.parentElement;
    const roomId = buttonElement.parentElement.parentElement.getAttribute('roomId');
    const postContent = parent.querySelector('.postContent').value.trim();
    // const postContentIsi = parent.querySelector('.postContentIsi').value.trim();
    let postContentIsi = editorsMDE[roomId].value();

    if(parent.querySelector('.btn-enkrip')){
        const password = parent.querySelector('.btn-enkrip').getAttribute('password');
        if(password){
            postContentIsi = iki64_encode(postContentIsi, password);
        }
    }

    if (!postContent) {
        alert("Isi post tidak boleh kosong!");
        return;
    }

    postData('api.php', { 'newPost': {roomId, postContent, postContentIsi} }, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            if(response.error){
                alert(response.error);
                return false;
            }else{
                const data = response;
                const postId = data._id;
                const time = data.created_at;
                const postContent= data.post.postContent;
                const postContentIsi= data.post.postContentIsi;

                if(data.edited_at){
                    var editedCheck = data.edited_at;
                }else{var editedCheck = false;}
        
                templatePost(roomId, postId, postContent, postContentIsi, userName, userColor, time, editedCheck);
                document.querySelector(`.room[roomid="${roomId}"] > .input-toggle`).click();
                location.reload();
            }
        })
        .catch(error => {
            console.error('Failed to post data:', error);
            alert('Error');
        });
}

function buatComment(buttonElement) {
    var commentContent = buttonElement.previousElementSibling.value.trim();
    let password, passworded;
    const postId = buttonElement.closest('.post').getAttribute('postid');
    const roomId = buttonElement.closest('.post').getAttribute('roomid');

    if (!commentContent) {
        alert("Isi komentar tidak boleh kosong!");
        return;
    }

    if(buttonElement.closest('.post').querySelector('.btn-enkrip')){
        password = buttonElement.closest('.post').querySelector('.btn-enkrip').getAttribute('password');
        if(password){
            commentContent = iki64_encode(commentContent, password);
            passworded = true;
        }
    }

    postData('api.php', { 'newComment': {roomId, postId, commentContent}}, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            if(response.error){
                alert(response.error);
                return false;
            }else{
                const data = response;
                const commentId = data._id;
                const time = data.created_at;
                const roomId = data.comment.roomId;
                const postId = data.comment.postId;
                let commentContent = data.comment.commentContent;

                if(passworded == true){
                    commentContent = iki64_decode(commentContent, password);
                }
        
                templateComment(roomId, postId, commentId, commentContent, userName, userColor, time);
        
                // buttonElement.parentElement.parentElement.querySelector('.input-toggle').click();
                buttonElement.previousElementSibling.value = '';
                templateNewActivity('New Comment', 'comment', userId, commentId, time);
            }
        })
        .catch(error => {
            console.error('Failed to post data:', error);
            alert('Error');
        });
}

function buatReply(buttonElement) {
    let password, passworded;
    var replyContent = buttonElement.previousElementSibling.value.trim();
    const commentId = buttonElement.closest('.comment').getAttribute('commentid');
    const postId = buttonElement.closest('.comment').getAttribute('postid');
    const roomId = buttonElement.closest('.comment').getAttribute('roomid');

    if (!replyContent) {
        alert("Isi reply tidak boleh kosong!");
        return;
    }

    if(buttonElement.closest('.post').querySelector('.btn-enkrip')){
        let password = buttonElement.closest('.post').querySelector('.btn-enkrip').getAttribute('password');
        if(password){
            replyContent = iki64_encode(replyContent, password);
            passworded = true;
        }
    }

    postData('api.php', { 'newReply': {roomId, postId, commentId, replyContent}}, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            if(response.error){
                alert(response.error);
                return false;
            }else{
                const data = response;
                const replyId = data._id;
                const time = data.created_at;
                const roomId = data.reply.roomId;
                const postId = data.reply.postId;
                const commentId = data.reply.commentId;
                let replyContent = data.reply.replyContent;

                if(passworded == true){
                    replyContent = iki64_decode(replyContent, password);
                }

                templateReply(roomId, postId, commentId, replyId, replyContent, userName, userColor, time);
        
                // buttonElement.parentElement.parentElement.querySelector('.input-toggle').click();
                buttonElement.previousElementSibling.value = '';
                templateNewActivity('New Reply', 'reply', userId, replyId, time);
            }
        })
        .catch(error => {
            console.error('Failed to post data:', error);
            alert('Error');
        });
}



function toggleInputContainer(toggleElement) {
    const inputContainer = toggleElement.nextElementSibling.nextElementSibling;
    inputContainer.style.display = inputContainer.style.display === 'none' ? 'flex' : 'none';
}
function toggleNewPost(toggleElement) {
    const inputContainer = toggleElement.nextElementSibling;
    inputContainer.style.display = inputContainer.style.display === 'none' ? 'block' : 'none';
    const room = toggleElement.closest('.room');
    const roomId = room.getAttribute('roomid');

    if(!room.classList.contains('editing')){
        const textarea = inputContainer.querySelector('.postContentIsi');
        editorsMDE[roomId] = new SimpleMDE({ element: textarea, spellChecker: false });
        room.querySelector('a[title="Insert Image (Ctrl-Alt-I)"]').setAttribute("onclick", "uploadImage(event)");
        room.classList.add('editing');
    }else{
        editorsMDE[roomId].toTextArea();
        editorsMDE[roomId] = null;
        room.classList.remove('editing');
    }

}


























function openRoom(elem){
    const parent = elem.parentElement;
    const posts = parent.querySelectorAll('.post');
    const inputToggle = parent.querySelector('.input-toggle');
    
    inputToggle.style.display = inputToggle.style.display === 'none' ? 'block' : 'none';
    
    posts.forEach(post => {
        post.style.display = post.style.display === 'none' ? 'block' : 'none';
    });
}

function openPost(elem){
    let post;
    if(elem.getAttribute('postid')){
        if(document.querySelector(`.post[postid='${elem.getAttribute('postid')}']`)){
            post = document.querySelector(`.post[postid='${elem.getAttribute('postid')}']`);
        }
    }else{
        if(elem.closest('.post')){
            post = elem.closest('.post');
        }
    }

    if(post == null){
        return;
    }

    const isiPost = post.querySelector('.isi-post');
    const commentContainer = post.querySelector('.comment-container');
    const inputPost = post.querySelector('.input-post');
    const closePost = post.querySelector('.close-post');

    post.style.marginBottom = post.style.marginBottom === '' ? '0' : '';
    post.style.marginTop = post.style.marginTop === '' ? '0' : '';
    post.style.boxShadow = post.style.boxShadow === '' ? '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' : '';
    commentContainer.style.display = commentContainer.style.display === 'none' ? 'block' : 'none';
    
    // popup
    post.style.width = post.style.width === '' ? '100%' : '';
    post.style.height = post.style.height === '' ? '100%' : '';
    post.style.left = post.style.left === '' ? '0' : '';
    post.style.top = post.style.top === '' ? '0' : '';
    post.style.position = post.style.position === '' ? 'fixed' : '';
    closePost.style.display = closePost.style.display === 'none' ? '' : 'none';
    post.style.overflow = post.style.overflow === '' ? 'scroll' : '';
    document.body.style.overflow = document.body.style.overflow === '' ? 'hidden' : '';

    if(isiPost){
        isiPost.style.display = isiPost.style.display === 'none' ? 'block' : 'none';
    }

    if(inputPost){
        inputPost.style.display = inputPost.style.display === 'none' ? 'block' : 'none';
    }
}








function editPostOpen(element){
    const post = element.closest('.post');
    const postId = post.getAttribute('postid');

    if(post.querySelector('.btn-enkrip')){
        var password = post.querySelector('.btn-enkrip').getAttribute('password') || undefined;
    }


    postData('api.php', { 'getPost': postId }, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            if(response.error){
                alert(response.error);
                return false;
            }else{
                const post = response;
                const roomId = post.post.roomId;
                const postId = post._id;
                const time = post.created_at;
                const postContent= post.post.postContent;
                var postContentIsi= post.post.postContentIsi;
                const userid = post.userid;
                const author = getAuthor(userid);

                if(password){
                    postContentIsi = iki64_decode(postContentIsi, password);
                }

                const postElem = document.querySelector(`.room[roomid="${roomId}"] > .post[postid="${postId}"]`);

                if(postElem.querySelector('.comment-container').style.display == 'none'){
                    openPost(element);
                }

                if(postElem.querySelector('.isi-post')){
                    postElem.querySelector('.isi-post').innerHTML = templateEditPost(postContent, postContentIsi);
                    postElem.querySelector('.isi-post').classList.remove('isi-post','md');
                    const textarea = postElem.querySelector('.postContentIsi');
                    editorsMDE[roomId] = new SimpleMDE({ element: textarea, spellChecker: false });
                    postElem.querySelector('a[title="Insert Image (Ctrl-Alt-I)"]').setAttribute("onclick", "uploadImage(event)");

                    const inputPost = postElem.querySelector('.input-post');
                    inputPost.style.display = '';
                }
            }
        })
        .catch(error => {
            console.error('Failed to post data:', error);
            alert('Error');
        });
}


function editPost(element){
    const post = element.closest('.post');
    const postId = post.getAttribute('postid');
    const roomId = post.getAttribute('roomid');
    const postContent = post.querySelector('.postContent').value.trim();
    var postContentIsi = editorsMDE[roomId].value();

    if(post.querySelector('.btn-enkrip')){
        const password = post.querySelector('.btn-enkrip').getAttribute('password');
        if(password){
            postContentIsi = iki64_encode(postContentIsi, password);
        }
    }

    postData('api.php', { 'editPost': {postId, postContent, postContentIsi} }, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            if(response.error){
                alert(response.error);
                return false;
            }else{
                const post = response;
                const roomId = post.post.roomId;
                const postId = post._id;
                const time = post.created_at;
                const postContent= post.post.postContent;
                const postContentIsi= post.post.postContentIsi;
                const userid = post.userid;
                const author = getAuthor(userid);

                location.reload();
            }
        })
        .catch(error => {
            console.error('Failed to post data:', error);
            alert('Error');
        });
}


function editCommentReplyOpen(element){
    let point, pointId, comment, reply, targetGet, editor;
    let post = element.closest('.post');

    if(element.parentElement.classList.contains('read-comment')){
        point = 'comment';
        comment = element.closest('.comment');
        pointId = comment.getAttribute('commentid');
        targetGet = 'getComment';
        editor = comment.querySelector('.isi-comment');
    }else if(element.parentElement.classList.contains('read-reply')){
        point = 'reply';
        reply = element.closest('.reply');
        pointId = reply.getAttribute('replyid');
        targetGet = 'getReply';
        editor = reply.querySelector('.isi-reply');
    }

    postData('api.php', { [targetGet]: pointId }, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            if(response.error){
                alert(response.error);
                return false;
            }else{
                console.log(response);
                let content = response.comment ? response.comment.commentContent : response.reply.replyContent;
                if(post.querySelector('.btn-enkrip')){
                    const password = post.querySelector('.btn-enkrip').getAttribute('password');
                    if(password){
                        editor.innerHTML = templateEditCommentReply(iki64_decode(content, password));
                    }else{
                        editor.innerHTML = templateEditCommentReply(content);
                    }
                }else{
                    editor.innerHTML = templateEditCommentReply(content);
                }
            }
        })
        .catch(error => {
            console.error('Failed to post data:', error);
            alert('Error');
        });
}


function editCommentReply(element){
    let content = element.previousElementSibling.value;
    const post = element.closest('.post');
    let point, pointId;
    if(element.parentElement.parentElement.classList.contains('isi-comment')){
        point = 'comment';
        pointId = element.closest('.comment').getAttribute('commentid');
    }else if(element.parentElement.parentElement.classList.contains('isi-reply')){
        point = 'reply';
        pointId = element.closest('.reply').getAttribute('replyid');
    }

    if(post.querySelector('.btn-enkrip')){
        const password = post.querySelector('.btn-enkrip').getAttribute('password');
        if(password){
            content = iki64_encode(content, password);
        }
    }


    postData('api.php', { 'editCommentReply': {point, pointId, content} }, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            if(response.error){
                alert(response.error);
                return false;
            }else{
                // console.log(response);
                location.reload();
            }
        })
        .catch(error => {
            console.error('Failed to post data:', error);
            alert('Error');
        });
}




function incrementNotification() {
  notificationCount++;
  updateNotificationCount();
}

function decrementNotification() {
  if (notificationCount > 0) {
    notificationCount--;
    updateNotificationCount();
  }
}

function resetNotification(){
    notificationCount = 0;
    updateNotificationCount();
}

function updateNotificationCount() {
  const badge = document.getElementById('notification-count');
  badge.textContent = notificationCount;
  
  if (notificationCount === 0) {
    badge.style.display = 'none'; // Sembunyikan badge jika tidak ada notifikasi
  } else {
    badge.style.display = 'block';
  }

  hideDeleted();
}







function handleImageUpload(event) {
    const roomid = event.target.getAttribute('roomid');
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('image', file);

        let headers = {
            'Authorization': `Bearer ${jwtToken}`
        };
        
        fetch('upload.php', {
            headers: headers,
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to upload image.');
            }
            return response.json();
        })
        .then(data => {
            const imageUrl = data.imageUrl;
            const cursor = editorsMDE[roomid].codemirror.getCursor();
            editorsMDE[roomid].codemirror.replaceSelection(`![${file.name}](${imageUrl})`);
        })
        .catch(error => {
            console.error('Error uploading image:', error);
        });
    }
}

function uploadImage(event){
    const roomid = event.target.closest('.room').getAttribute('roomid');
    const input = document.createElement("input");
    input.setAttribute("roomid", roomid);
    input.type = "file";
    input.accept = "image/*";
    input.onchange = handleImageUpload;
    input.click();
};


// enkrip post
function enkrip(w){
    alert('apakah anda yakin ingin mempassword post ini? \n jika iya, maka anda harus tahu bahwa post akan di enkripsi menggunakan iki64 di sisi client dan hanya yang memiliki password yang bisa membaca post.');
    let pw = prompt('Password');
    if(pw){
        w.setAttribute('password', pw);
    }
}

function dekrip(w){
    let post = w.closest('.post');

    if(post.querySelector('.btn-enkrip').getAttribute('password')){
        let listMd = post.querySelectorAll('.md');
        listMd.forEach(md => {
            if(md.getAttribute('dekrip') == null){
                md.innerHTML = marked.parse(escapeHTML(iki64_decode(md.innerText, post.querySelector('.btn-enkrip').getAttribute('password'))));
                md.setAttribute('dekrip', 'true');
            }
        })
        return;
    }

    let pw = prompt('Password');
    post.querySelector('.btn-enkrip').setAttribute('password', pw);

    let listMd = post.querySelectorAll('.md');
    listMd.forEach(md => {
        if(isBase64(md.innerText)){
            md.innerHTML = marked.parse(escapeHTML(iki64_decode(md.innerText, pw)));
            md.setAttribute('dekrip', 'true');
        }
    })
}

function deleteByModerator(w){
    var point;
    var content;
    if(w.parentElement.classList.contains('read-post')){
        point = 'post';
        content = {
                    'point':'post',
                    'roomid':w.closest('.post').getAttribute('roomid'),
                    'postid':w.closest('.post').getAttribute('postid')
                 };
    }else if(w.parentElement.classList.contains('read-comment')){
        point = 'comment';
        content = {
            'point':'comment',
            'roomid':w.closest('.post').getAttribute('roomid'),
            'postid':w.closest('.post').getAttribute('postid'),
            'commentid':w.closest('.comment').getAttribute('commentid')
         };
    }else if(w.parentElement.classList.contains('read-reply')){
        point = 'reply';
        content = {
            'point':'reply',
            'roomid':w.closest('.post').getAttribute('roomid'),
            'postid':w.closest('.post').getAttribute('postid'),
            'commentid':w.closest('.comment').getAttribute('commentid'),
            'replyid':w.closest('.reply').getAttribute('replyid')
         };
    }else if(w.parentElement.classList.contains('room')){
        point = 'room';
        content = {
            'point':'room',
            'roomid':w.closest('.room').getAttribute('roomid')
         };
    }

    if(confirm(`apakah anda yakin ingin menghapus ${point}?`) == true){
        postData('api.php', { 'deleteByMod': content }, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            if(response.error){
                alert(response.error);
                return false;
            }else{
                if(point=='post'){
                    document.querySelector(`.post[postid='${response._id}']`).remove();
                }else if(point=='comment'){
                    document.querySelector(`.comment[commentid='${response._id}']`).remove();
                }else if(point=='reply'){
                    document.querySelector(`.reply[replyid='${response._id}']`).remove();
                }else if(point=='room'){
                    document.querySelector(`.room[roomid='${response._id}']`).remove();
                }
            }
        })
        .catch(error => {
            console.error('Failed to post data:', error);
            alert('Error');
        });
    }
}


function hideDeleted(){
    var del = document.querySelectorAll('del');

    del.forEach(d => {
        if(d.parentElement.innerHTML == '⛔️ <del>Deleted by Moderator</del> ⛔️'){
            d.parentElement.parentElement.parentElement.parentElement.remove();
        }
    })

    var roomDel = document.querySelectorAll('.room');
    roomDel.forEach(r => {
        if(r.querySelector('.nama-room').innerText.search('⛔️') == 0){
            r.querySelector('.nama-room').parentElement.remove();
        }
    })
}