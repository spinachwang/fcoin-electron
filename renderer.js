let loginBtn = document.getElementsByClassName("login-btn")[0];


loginBtn.addEventListener("click", (e) => {
    e.preventDefault();

    let user = document.getElementById("user").value;
    let pwd = document.getElementById("pwd").value;

    // send request to validate


    window.location.href = 'file://' + __dirname + '/sections/fcoin.html'
});



