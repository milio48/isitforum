var now = new Date();
var skrg = Math.floor(now.getTime() / 1000);
localStorage.setItem('last', skrg);
var last = localStorage.getItem('last');

function ajax(){
    last = localStorage.getItem('last');
    postData(`ajax.php`, {'time':last}, true)
        .then(response => {
            if(response.error && response.error.token){logout()}
            if(response.error){
                alert(response.error);
                return false;
            }else{
                if(response.length!==0){
                    incrementNotification();
                    startAnimation('body');
                    now = new Date();
                    skrg = Math.floor(now.getTime() / 1000);
                    localStorage.setItem('last', skrg);
                }


                var json_data = response;
                if(json_data.room){
                    const rooms = json_data.room;
                    rooms.forEach(function(room) {
                        if(room._id==1){ // jika room pertama, reset pesan room kosong.
                            document.getElementById('forum').innerHTML = '';
                        }
        
                        templateRoom(room._id, room.room);
                        templateNewActivity('New Room', 'room', room.userid, room._id, room.created_at);
                    });
                }
        
                if(json_data.post){
                    const posts = json_data.post;
                    posts.forEach(function(post) {
                        const roomId = post.post.roomId;
                        const postId = post._id;
                        const time = post.created_at;
                        const postContent= post.post.postContent;
                        const postContentIsi= post.post.postContentIsi;
                        const userid = post.userid;
                        const author = getAuthor(userid);
        
                        if(post.edited_at){
                            var editedCheck = post.edited_at;
                        }else{var editedCheck = false;}
        
                        templatePost(roomId, postId, postContent, postContentIsi, author.username, author.color, time, editedCheck);
                        if(document.querySelector(`.post[postid='${postId}']`).querySelector('.edited-post')){
                            templateNewActivity('Edit Post', 'post', author._id, postId, time);
                        }else{
                            templateNewActivity('New Post', 'post', author._id, postId, time);
                        }
        
                    });
                }
        
                if(json_data.comment){
                    const comments = json_data.comment;
                    comments.forEach(function(comment) {
                        const commentId = comment._id;
                        const time = comment.created_at;
                        const roomId = comment.comment.roomId;
                        const postId = comment.comment.postId;
                        const commentContent = comment.comment.commentContent;
                        const userid = comment.userid;
                        const author = getAuthor(userid);
                        
                        templateComment(roomId, postId, commentId, commentContent, author.username, author.color, time);
                        templateNewActivity('New Comment', 'comment', author._id, commentId, time);
                    });
                }
        
                if(json_data.reply){
                    const replies = json_data.reply;
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
                        templateNewActivity('New Reply', 'reply', author._id, replyId, time);
                    });
                }
        
                if(json_data.activity){
                    const activities = json_data.activity;
                    activities.forEach(function(activity) {
                        templateNewActivity(activity.activity, activity.point, activity.userid, activity.id, activity.created_at)
                    });
                }
            }
        })
        .catch(error => {
            console.error('Failed to post data:', error);
            alert('Error');
        });
}


function runAjax(seconds=10) {
    console.log('run AjAX');
    ajax();
    setInterval(() => {
        ajax();
    }, seconds * 1000);
}