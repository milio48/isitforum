function templateRoom(roomId, roomName){
    const roomElement = `<div class="room" roomId="${roomId}">
                            <h2 class="nama-room" onclick="openRoom(this)">${roomName}</h2>
                            <div class="input-toggle" onclick="toggleNewPost(this)">Buat Post Baru</div>
                            <div class="input-post" style="display:none">
                                <input type="text" class="postContent" placeholder="Judul Postingan">
                                <br>
                                <div class="editor-container">
                                    <textarea class="postContentIsi" rows="5" cols="50" placeholder="Isi Postingan"></textarea>
                                </div>
                                <br>
                                <button onclick="buatPost(this)" class="btn-comment">Tambah Post</button>
                            </div>
                        </div>`;
    document.querySelector('#forum').innerHTML += roomElement;
}

function templatePost(roomId, postId, postContent, postContentIsi, userName, userColor, time, editedCheck=null) {
    if(window.userName == userName){
        var edit = `<span class="user-tag" style="color: blue; cursor:pointer;" onclick="editPostOpen(this);">[edit]</span>`;
    }else{var edit = '';}

    if(editedCheck){
        var editedCheckElem = `<span class="edited-post" style="color: brown;" onclick="alert('Diedit : '+formatTime(${editedCheck}));">[edited]</span>`;
    }else{var editedCheckElem=''}

    const postElement = `<div class="post" postid="${postId}" roomId="${roomId}">
                        <div class="read-post">
                            <span class="judul-post" onclick="openPost(this)">${postContent}</span>
                            <span class="user-tag" style="color: ${listWarna[userColor]}">[${userName}]</span>
                            <span class="time-tag" onclick="alert('Dibuat : '+formatTime(${time}))" created_at="${time}">${timeAgo(time)}</span>
                            ${editedCheckElem}
                            ${edit}
                            <div class="isi-post md" style="display:none">${marked.parse(escapeHTML(postContentIsi))}</div>
                        </div>
                        <div class="comment-container" style="display:none">
                            <div class="input-toggle" onclick="toggleInputContainer(this)">Tambah Komentar</div>
                            <div class="comment-data"></div>
                            <div class="input-container" style="display: flex;">
                                <textarea class="commentContent" rows="3" placeholder="Isi Komentar"></textarea>
                                <button onclick="buatComment(this)" class="btn-comment">Komentar</button>
                            </div>
                        </div>
                    </div>`;

    if(document.querySelector(`.post[postid='${postId}']`)){
        document.querySelector(`.post[postid='${postId}']`).outerHTML = '';
    }

    document.querySelector(`.room[roomid="${roomId}"]`).innerHTML += postElement;
    

    var images = document.querySelector(`.room[roomid="${roomId}"]`).querySelectorAll('p img');
    images.forEach(function(img) {
        img.addEventListener('click', function() {
            window.open(img.src, '_blank');
        });
    });
}

function templateComment(roomId, postId, commentId, commentContent, userName, userColor, time){
    const commentElement = `<div class="comment" commentid="${commentId}" postId="${postId}" roomId="${roomId}">
                                <div class="read-comment">
                                    <span class="user-tag" style="color: ${listWarna[userColor]}">[${userName}]</span>
                                    <span class="time-tag" onclick="alert(formatTime(${time}))" created_at="${time}">${timeAgo(time)}</span>
                                    <div class="isi-comment md">${marked.parse(escapeHTML(commentContent))}</div>
                                </div>
                                <div class="reply-container">
                                    <div class="input-toggle" onclick="toggleInputContainer(this)">Balas</div>
                                    <div class="reply-data"></div>
                                    <div class="input-container" style="display: none;">
                                        <textarea class="replyContent" rows="2" placeholder="Isi Balasan"></textarea>
                                        <button onclick="buatReply(this)" class="btn-reply">Balas</button>
                                    </div>
                                </div>
                            </div>`;
    const commentTarget = document.querySelector(`.room[roomid="${roomId}"] > .post[postid="${postId}"] > .comment-container > .comment-data`);
    commentTarget.innerHTML += commentElement;
}

function templateReply(roomId, postId, commentId, replyId, replyContent, userName, userColor, time){
    const replyElement = `<div class="reply" replyId="${replyId}" postId="${postId}" commentId="${commentId}" roomId="${roomId}">
                            <div class="read-reply">
                                <span class="user-tag" style="color: ${listWarna[userColor]}">[${userName}]</span>
                                <span class="time-tag" onclick="alert(formatTime(${time}))" created_at="${time}">${timeAgo(time)}</span>
                                <div class="isi-reply md">${marked.parse(escapeHTML(replyContent))}</div>
                            </div>
                        </div>`;

    const replyTarget = document.querySelector(`.room[roomid="${roomId}"] > .post[postid="${postId}"] > .comment-container > .comment-data > .comment[commentid="${commentId}"] > .reply-container > .reply-data`);
    replyTarget.innerHTML += replyElement;
}


function templateEditPost(postContent, postContentIsi){
    const editPostElement = `
    <div class="input-post">
                                <input type="text" class="postContent" placeholder="Judul Postingan" value="${postContent}">
                                <br>
                                <div class="editor-container">
                                    <textarea class="postContentIsi" rows="5" cols="50" placeholder="Isi Postingan">${postContentIsi}</textarea>
                                </div>
                                <br>
                                <button onclick="editPost(this)" class="btn-comment" style="background-color:grey" onclick="location.reload()">Cancel</button>
                                <button onclick="editPost(this)" class="btn-comment">Edit Post</button>
                            </div>
    `;
    return editPostElement;
}

function templateNewActivity(activity, point, userid, id, created_at) {
    var activityListDiv = document.getElementById("activity-list");
    var detailPoint;
    var emoji;

    const author = getAuthor(userid);
    // console.log(author);

    if(point=='room'){
        emoji = '🛋️';
        detailPoint = document.querySelector(`.room[roomid="${id}"] > .nama-room`).innerText;
    }else if(point=='post'){
        emoji = '📝';
        detailPoint = document.querySelector(`.post[postid="${id}"]`).querySelector(`.judul-post`).innerText;
    }else if(point=='comment'){
        emoji = '💬';
        var commentTarget = document.querySelector(`.comment[commentid="${id}"]`).getAttribute(`postid`);
        detailPoint = document.querySelector(`.post[postid="${commentTarget}"]`).querySelector(`.judul-post`).innerText;
    }else if(point=='reply'){
        emoji = '↩️';
        var replyTarget = document.querySelector(`.reply[replyid="${id}"]`).getAttribute(`postid`);
        detailPoint = document.querySelector(`.post[postid="${replyTarget}"]`).querySelector(`.judul-post`).innerText;
    }else if(point=='user'){
        emoji = '👤';
        detailPoint = ``;
    }
    

    activityListDiv.innerHTML = `
        <div point="${point}" onclick="scrollToPoint('${point}', '${id}')">
            ${emoji}
            ${activity}
            <span class="user-tag" style="color: ${listWarna[author.color]}">[${author.username}]</span>
            <span style="font-weight:bold">${detailPoint}</span>
            <span class="time-tag" onclick="alert(formatTime(${created_at}))" created_at="${created_at}">${timeAgo(created_at)}</span>
        </div>
        ${activityListDiv.innerHTML}
    `;
}


function templateGreetingAndMenu() {
    return `
    <hr>
        Selamat Datang
        <span class="user-tag" style="color: ${listWarna[userColor]}">[${userName}]</span>
        !
        <div id="menu" style="position: fixed; bottom: 1em; left: 50%; transform: translateX(-50%); background-color: white; width: 70%; border-radius: 25px;border: solid 1px #80808075;">
            <div class="notification-icon">
                <span class="badge" id="notification-count" style="display:none">0</span>
                <span  style="color: #3e5faf; cursor:pointer; font-weight: bold; margin-left: 1em;" onclick="scrollToPoint('user'); resetNotification();">[Notification]</span>
            </div>
            <span  style="color: #3e5faf; cursor:pointer; font-weight: bold; margin-left: 1em;" onclick="scrollToPoint('setting')">[Setting]</span>
        </div>
        <hr><br>
    `;
}

function templateUploads(data) {
    let author = getAuthor(data.userid);
    tableElement = `
    <tr>
        <td>${data._id}</td>
        <td style="color:darkblue;cursor:pointer;" onclick="openImg('${data.unique_filename}')">${data.file_name}</td>
        <td><span class="user-tag" style="color: ${listWarna[author.color]}">[${author.username}]</span></td>
        <td onclick="alert(formatTime(${data.created_at}))">${timeAgo(data.created_at)}</td>
        <td><button onclick="copyToClipboard('![${data.file_name}](uploads/${data.unique_filename})', 'Code (${data.file_name}) telah tercopy.')">Copy!</button></td>
    </tr>
    `;
    
    let uploadList = document.getElementById('uploads-tbody').innerHTML;
    document.getElementById('uploads-tbody').innerHTML = tableElement + uploadList;
}