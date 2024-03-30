
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
        // console.log(response);
        if(!response.error){
            saveTokenToLocalStorage(response.token);
            payload = readPayloadFromJwt();
            // console.log(payload);
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
        // console.log(payload);
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
    const postContentIsi = editorsMDE[roomId].value();
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
    const commentContent = buttonElement.previousElementSibling.value.trim();
    const postId = buttonElement.closest('.post').getAttribute('postid');
    const roomId = buttonElement.closest('.post').getAttribute('roomid');
    if (!commentContent) {
        alert("Isi komentar tidak boleh kosong!");
        return;
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
                const commentContent = data.comment.commentContent;
        
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
    const replyContent = buttonElement.previousElementSibling.value.trim();
    const commentId = buttonElement.closest('.comment').getAttribute('commentid');
    const postId = buttonElement.closest('.comment').getAttribute('postid');
    const roomId = buttonElement.closest('.comment').getAttribute('roomid');

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
                const replyContent = data.reply.replyContent;
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
        post = document.querySelector(`.post[postid='${elem.getAttribute('postid')}']`);
    }else{
        post = elem.closest('.post');
    }

    const isiPost = post.querySelector('.isi-post');
    const commentContainer = post.querySelector('.comment-container');
    const inputPost = post.querySelector('.input-post');

    post.style.marginBottom = post.style.marginBottom === '' ? '60px' : '';
    post.style.marginTop = post.style.marginTop === '' ? '60px' : '';
    post.style.boxShadow = post.style.boxShadow === '' ? '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' : '';
    commentContainer.style.display = commentContainer.style.display === 'none' ? 'block' : 'none';
    
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
    console.log(post);

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
                const postContentIsi= post.post.postContentIsi;
                const userid = post.userid;
                const author = getAuthor(userid);

                console.log(roomId, postId, postContent, postContentIsi, author.username, author.color, time);
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
    const postContentIsi = editorsMDE[roomId].value();
    console.log(post);

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

                // console.log(roomId, postId, postContent, postContentIsi, author.username, author.color, time);
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