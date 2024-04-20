function runSSE(){
    // return false; 
    console.log('run SSE');
    const eventSource = new EventSource(`sse.php?token=${jwtToken}`);

    eventSource.onmessage = function(event) {
        startAnimation('body');
        const json_data = JSON.parse(event.data);
        
        incrementNotification();

        if(json_data[0].room){
            const rooms = json_data;
            rooms.forEach(function(room) {
                if(room._id==1){ // jika room pertama, reset pesan room kosong.
                    document.getElementById('forum').innerHTML = '';
                }

                templateRoom(room._id, room.room);
                templateNewActivity('New Room', 'room', room.userid, room._id, room.created_at);
            });
        }

        if(json_data[0].post){
            const posts = json_data;
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

        if(json_data[0].comment){
            const comments = json_data;
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

        if(json_data[0].reply){
            const replies = json_data;
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

        if(json_data[0].activity){
            const activities = json_data;
            activities.forEach(function(activity) {
                templateNewActivity(activity.activity, activity.point, activity.userid, activity.id, activity.created_at)
            });
        }
    };
}


