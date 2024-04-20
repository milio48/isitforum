var userName;
var userColor;
var userId;
var jwtToken ='';
var moderator = '';

var listUser;
var listWarna;
var listPertanyaan;

var editorsMDE = [];

var notificationCount = 0;
var realtime;
var reloadRealtime;



function startAnimation(dom) {
    document.querySelector(dom).classList.add('animation');
    setTimeout(function() {
        document.querySelector(dom).classList.remove('animation');
    }, 2000);
}

function timeAgo(timestamp) {
    var currentTime = new Date().getTime() / 1000;
    var difference = currentTime - timestamp;

    var minutesAgo = Math.floor(difference / 60);
    var hoursAgo = Math.floor(difference / 3600);
    var daysAgo = Math.floor(difference / 86400);
    var weeksAgo = Math.floor(difference / 604800);

    if (weeksAgo >= 1) {
        return weeksAgo + " mg lalu";
    } else if (daysAgo >= 1) {
        return daysAgo + " hr lalu";
    } else if (hoursAgo >= 1) {
        return hoursAgo + " jm lalu";
    } else {
        return minutesAgo + " mnt lalu";
    }
}

function updateTimeAgo() {
    var currentTime = Math.floor(Date.now() / 1000);
    var timeTags = document.querySelectorAll('.time-tag');

    timeTags.forEach(function(timeTag) {
        var createdAt = parseInt(timeTag.getAttribute('created_at'), 10);
        timeTag.textContent = timeAgo(createdAt);
    });
}

// Memanggil updateTimeAgo setiap menit
setInterval(updateTimeAgo, 60000);

function formatTime(unixTimestamp) {
    const days = ['Sab', 'Ahd', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum'];
    const date = new Date(unixTimestamp * 1000); // Convert UNIX timestamp to milliseconds
    const hours = ('0' + date.getHours()).slice(-2); // Add leading zero if needed
    const minutes = ('0' + date.getMinutes()).slice(-2); // Add leading zero if needed
    const dayOfWeek = days[date.getDay()]; // Get abbreviated day of the week
    const dayOfMonth = ('0' + date.getDate()).slice(-2); // Add leading zero if needed
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // Add leading zero if needed
    const year = date.getFullYear(); // Get full year

    return `${hours}:${minutes} ${dayOfWeek}, ${dayOfMonth}/${month}/${year}`;
}


function postData(url, data = {}, check) {
    let headers = {
        'Content-Type': 'application/json'
    };

    if (check) {
        headers['Authorization'] = 'Bearer ' + jwtToken;
    }

    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to post data');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error posting data:', error);
        throw error;
    });
}


function saveTokenToLocalStorage(token) {
    localStorage.setItem('jwtToken', token);
}

function getTokenFromLocalStorage() {
    return localStorage.getItem('jwtToken');
}

function readPayloadFromJwt(inputJwt) {
    if(inputJwt){
        jwtToken = inputJwt;
    }else{
        jwtToken = getTokenFromLocalStorage();

        if (!jwtToken) {
            return null;
        }
    }
    
    try {
        if(!isJWT(jwtToken)){
            logout();
            return;
        }
        const decodedToken = JSON.parse(atob(jwtToken.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);

        if(decodedToken.exp > currentTime){
            return decodedToken;
        }else{
            return 'Token Expired';
        }
    } catch (error) {
        console.error("Terjadi kesalahan dalam membaca payload dari token JWT:", error);
        return null;
    }

            function isJWT(str) {
                const parts = str.split('.');
                return Array.isArray(parts) && parts.length === 3;
            }
}

function arraySearch(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
}

function scrollToPoint(point, id) {
    let selector;

    if(point=='room'){
        selector = `.room[roomid='${id}']`;
        go(selector);
    }else if(point=='post'){
        selector = `.post[postid='${id}']`;
        try {
            if(document.querySelector(selector).style.display == 'none'){
                document.querySelector(selector).style.display = 'block';
            }
        } catch (error) {
            
        }finally{
            go(selector);
        }
    }else if(point=='comment'){
        selector = `.comment[commentid='${id}']`;

        try {
            if(document.querySelector(selector).closest('.comment-container').style.display == 'none'){
                openPost(document.querySelector(selector));
            }
        } catch (error) {}finally{
            go(selector);
        }
    }else if(point=='reply'){
        selector = `.reply[replyid='${id}']`;
        try {
            if(document.querySelector(selector).closest('.comment-container').style.display == 'none'){
                openPost(document.querySelector(selector));
            }
        } catch (error) {
            
        }finally{
            go(selector);
        }
    }else if(point=='user'){
        selector = `#activity`;
        go(selector);
    }else if(point=='setting'){
        selector = `#setting`;
        go(selector);
    }else if(point=='upload'){
        selector = `#uploads`;
        go(selector);
    }


    function go(selector){
        var element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function getAuthor(id){
    if(arraySearch(listUser, '_id', id)){
        return arraySearch(listUser, '_id', id);
    }else{
        console.info('user baru?');
        // return readAllUser(id);
        if(confirm("Terdeteksi terdapat user baru. \n tekan ok untuk memuat ulang dan update data. \n tekan cancel untuk melanjutkan")){
            location.reload();
        }
    }
}


function filterActivity(event, point) {
    const activityList = document.querySelectorAll('#activity-list > div');
    const buttons = document.querySelectorAll('#filter-buttons button');

    activityList.forEach(activity => {
        if (point === 'all' || activity.getAttribute('point') === point) {
            activity.style.display = 'block'; // Tampilkan elemen
        } else {
            activity.style.display = 'none'; // Sembunyikan elemen
        }
    });

    // Menghapus kelas 'active' dari semua tombol
    buttons.forEach(button => {
        button.classList.remove('active');
    });

    // Menambahkan kelas 'active' ke tombol yang dipilih
    event.target.classList.add('active');
}

function escapeHTML(text) {
    return text.replace(/[<>"'&]/g, function(match) {
        return {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '&': '&amp;'
        }[match];
    });
}


function openImg(elem){
    if(typeof elem == 'string'){
        window.open('uploads/'+elem, '_blank');
    }
}

function copyToClipboard(text, pesan) {
    const input = document.createElement('textarea');
    input.innerHTML = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    if(typeof pesan == 'string'){
        alert(pesan);
    }
}

function isBase64(str) {
    const regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    return regex.test(str);
}