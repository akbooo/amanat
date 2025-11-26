/**
 * 
 * This function displays error messages for logging in, if there are any. Otherwise,
 * it will relocate the user to admin-dashboard if the logged in user is administrator
 * else it will start their session (express session) and redirect them to home page.
 * 
 * @param {*} data as object
 */
function loginHandler(data) {
    if (data == "NoEmailExist") {
        document.getElementById("loginErrorMessage").style.display = 'block';
        document.getElementById("loginErrorMessage").innerHTML = "User with that email does not exist"
    } else if (data == "wrongPassword") {
        document.getElementById("loginErrorMessage").style.display = 'block';
        document.getElementById("loginErrorMessage").innerHTML = "Incorrect Password"
    } else if (data.isAdmin) {
        document.getElementById("loginErrorMessage").style.display = 'none';
        document.getElementById('loginSuccessModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            window.location = '/admin-dashboard'
        }, 2500);
    } else {
        document.getElementById("loginErrorMessage").style.display = 'none';
        document.getElementById('loginSuccessModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            window.location = '/'
        }, 2500);
    }
}

$('#loginBtn').click(() => {
    $.ajax({
        url: '/login',
        type: 'POST',
        data: {
            email: $("#email").val(),
            password: $("#password").val(),
        },
        success: loginHandler
    })
});


const input = document.querySelectorAll(".form-control");
for (var i = 0; i < input.length; i++) {
    input[i].addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            document.getElementById("loginBtn").click();
        }
    });
}