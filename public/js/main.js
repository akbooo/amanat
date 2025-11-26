$(document).ready(function () {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navLink = document.querySelectorAll('.nav-link');
    var socket;
    var orderId;
    var element;
    const chatExpiredModal = document.getElementById('chatExpiredModal');

    loadNavbarFooter();

    function patientNavbarSetup() {
        var patientEls = document.querySelectorAll(".isPatient");
        for (var x = 0; x < patientEls.length; x++)
            patientEls[x].style.display = 'list-item';
    }

    function therapistNavbarSetup() {
        let therapistEls = document.querySelectorAll(".isTherapist");
        for (var x = 0; x < therapistEls.length; x++)
            therapistEls[x].style.display = 'list-item';
    }

    function adminNavbarSetup() {
        let adminEls = document.querySelectorAll(".isAdmin");
        for (var x = 0; x < adminEls.length; x++)
            adminEls[x].style.display = 'list-item';
    }

    function loggedInNavbarSetup() {
        let loggedInEls = document.querySelectorAll(".isLoggedIn");
        for (var x = 0; x < loggedInEls.length; x++)
            loggedInEls[x].style.display = 'list-item';
    }

    function loggedOutNavbarSetup() {
        let loggedOutEls = document.querySelectorAll(".isLoggedOut")
        for (var x = 0; x < loggedOutEls.length; x++)
            loggedOutEls[x].style.display = 'list-item';
    }

    setTimeout(() => {
        $.get('/isLoggedIn', function (user) {
            if (user) {
                loggedInNavbarSetup()
                if (user.userType == 'patient') {
                    patientNavbarSetup()
                } else if (user.userType == 'therapist') {
                    therapistNavbarSetup();
                } else if (user.userType == 'admin') {
                    adminNavbarSetup()
                }
                setTimeout(() => {
                    $('.logout-link').click(function () {
                        $.post('/logout');
                        window.location = '/login'
                    })
                }, 400);
            } else {
                loggedOutNavbarSetup();
            }
        })

    }, 50);

    displayPassword();

    if (navToggle) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.add('show-menu');
        });
    }

    if (navClose) {
        navClose.addEventListener('click', function () {
            navMenu.classList.remove('show-menu');
        });
    }

    function loadNavbarFooter() {
        $('#navPlaceHolder').load('../temp/nav.html', function () {
            $('.nav-item .nav-link').each(function () {
                $(this).toggleClass('active', this.getAttribute('href') === location.pathname);
            });
            $('.nav-link .nav-icon').each(function () {
                $(this).toggleClass('active', this.getAttribute('href') === location.pathname);
            });

            $('.navLinks a').each(function () {
                $(this).toggleClass('active', this.getAttribute('href') === location.pathname);
            });
        });
        $('#footerPlaceHolder').load('../temp/footer.html');
        $('#therapistChat').load('../temp/chatbox.html');
    }

    function displayPassword() {
        $("#show-hide-password .input-group-addon a").on('click', function (event) {
            event.preventDefault();
            if ($('#show-hide-password input').attr("type") == "text") {
                $('#show-hide-password input').attr('type', 'password');
                $('#show-hide-password .input-group-addon a i').addClass("fa-eye-slash");
                $('#show-hide-password .input-group-addon a i').removeClass("fa-eye");
            } else if ($('#show-hide-password input').attr("type") == "password") {
                $('#show-hide-password input').attr('type', 'text');
                $('#show-hide-password .input-group-addon a i').removeClass("fa-eye-slash");
                $('#show-hide-password .input-group-addon a i').addClass("fa-eye");
            }
        });
    }

    function linkAction() {
        document.getElementById('nav-menu').classList.remove('show-menu');
    }

    navLink.forEach(n => n.addEventListener('click', linkAction));

    /**
     * 
     * AJAX call to load messages for chatbox.
     * 
     * @param {*} data as an object
     */
    function loadMsgs(data) {
        $.ajax({
            url: '/loadMsgs',
            type: 'POST',
            data: {
                orderId: data.orderId
            },
            success: function (chats) {
                chats.forEach(function (element) {
                    let msgClass = (data.currentId == element.sender) ? 'self' : 'other';
                    var messagesContainer = $('#chatMessages');
                    messagesContainer.append([
                        `<li class="${msgClass}" data-before="Sent at ${new Date(element.createdAt).toLocaleString('en-CA', { hour: 'numeric', minute: 'numeric', hour12: true })}">`,
                        element.message,
                        '</li>'
                    ].join(''));
                })
            }
        })
    }

    /**
     * 
     * Socket setup for chat rooms.
     * 
     * @param {*} data as an object
     */
    function socketSetup(data) {
        socket.emit('join-room', data.orderId, data.sender);
        socket.emit('check-status', data.other, function () {
            changeActiveState('Online')
        });

        socket.on("chat message", (msg) => {
            var messagesContainer = $('#chatMessages');
            messagesContainer.append([
                `<li class="other" data-before="Sent at ${new Date().toLocaleString('en-CA', { hour: 'numeric', minute: 'numeric', hour12: true })}">`,
                msg.message,
                '</li>'
            ].join(''));
        });

        socket.on('summary-result', (data) => {
            var messagesContainer = $('#chatMessages');
            if (data.status === 'sent') {
                messagesContainer.append([
                    `<li class="system">Summary emailed to ${data.email}</li>`
                ].join(''));
            } else if (data.status === 'saved') {
                messagesContainer.append([
                    `<li class="system">Summary could not be emailed; it was saved for you (id: ${data.id}) — <a href="#" class="view-summary" data-id="${data.id}">view</a></li>`
                ].join(''));
            } else {
                messagesContainer.append([
                    `<li class="system" style="color: #e63946;">Summary request failed: ${data.error || 'unknown error'}</li>`
                ].join(''));
            }

            messagesContainer.finish().animate({
                scrollTop: messagesContainer.prop("scrollHeight")
            }, 500);
        });

        $(document).on('click', '.view-summary', function (e) {
            e.preventDefault();
            const id = $(this).data('id');
            if (!id) return;

            const messagesContainer = $('#chatMessages');
            $.ajax({
                url: `/summary/${id}`,
                method: 'GET',
                success: function (data) {
                    const text = data.summary || 'No summary text available.';
                    messagesContainer.append([
                        `<li class="system">Saved summary (id: ${id}):<div style="margin-top:0.5rem;white-space:pre-wrap;">${text}</div></li>`
                    ].join(''));
                    messagesContainer.finish().animate({ scrollTop: messagesContainer.prop('scrollHeight') }, 500);
                },
                error: function (xhr) {
                    const msg = (xhr && xhr.responseJSON && xhr.responseJSON.error) ? xhr.responseJSON.error : 'Failed to load summary.';
                    messagesContainer.append([`<li class="system" style="color:#e63946;">${msg}</li>`].join(''));
                }
            });
        });

        socket.on('connected', function (connectedId) {
            if (connectedId != data.currentId)
                changeActiveState('Online');
        })

        socket.on('disconnected', function () {
            changeActiveState('Offline');
        })

    }

    $.get('/activeChatSession', function (data) {
        if (data == "NoActiveSession" || data == "notLoggedIn") {
            $('#therapistChat').hide();
        } else {
            let therapistEls = document.querySelectorAll(".hasActiveSession");
            for (var x = 0; x < therapistEls.length; x++)
                therapistEls[x].style.display = 'list-item';
            if (window.location.pathname != '/chat-session' && document.body.clientWidth < 992) {
                $('#therapistChat').hide();
            } else {
                socket = io();
                $('#therapistChat').css('display', 'flex');
                loadMsgs(data);
                chatSetup();
                orderId = data.orderId;
                socketSetup(data);
                // Display name as provided. The server may anonymize patient details
                // (e.g. when the logged-in user is a therapist) so guard against
                // empty/blank values for phone/image and avoid creating broken links.
                $("#chatName").text(data.name || '')

                if (data.phone) {
                    $("#chatPhone").attr("href", `tel:${data.phone}`).show();
                } else {
                    $("#chatPhone").attr("href", "#").hide();
                }

                if (data.image) {
                    $("#chatImg").attr("src", data.image);
                } else {
                    $("#chatImg").attr("src", "/images/placeholder-profile.jpg");
                }
            }
        }
    })


    setInterval(getSessionEndTime, 1000);

    function getSessionEndTime() {
        $.get('/activeChatSession', function (data) {
            if (data != "NoActiveSession" && data != "notLoggedIn") {
                var currDate = new Date();
                var expiringDate = new Date(data.purchased);
                var diffTime = Math.abs((expiringDate.getTime() - currDate.getTime()) / 1000);
                var diffHours = Math.floor(diffTime / 3600) % 24;
                diffTime -= diffHours * 3600;
                var diffMins = Math.floor(diffTime / 60) % 60;
                diffTime -= diffMins * 60;
                var diffSecs = Math.floor(diffTime % 60);
                if (diffMins == 0 && diffSecs != 0) {
                    $("#sessionTimer").text('Session expires in ' + diffSecs + 's');
                } else if (diffMins == 0 && diffSecs == 0) {
                    $("#sessionTimer").text('Chat ended');
                    var textInput = element.find('#chatbox');
                    textInput.keydown(onMetaAndEnter).prop("disabled", true).focus();
                    document.getElementById('sendMessage').style.backgroundColor = '#858585';
                    chatExpiredModal.style.display = 'block';
                    document.getElementById("closeChatExpired").onclick = function () {
                        chatExpiredModal.style.display = "none";
                        document.body.style.overflow = 'auto';
                    }
                } else {
                    $("#sessionTimer").text('Session expires in ' + diffMins + 'm ' + diffSecs + 's');
                }
            }
        })
    }

    function chatSetup() {
        if (window.location.pathname == '/chat-session') {
            element = $('#wrapper');
            var messages = element.find('#chatMessages');
            var userInput = $('#chatbox');
            userInput.keydown(onMetaAndEnter).prop("disabled", false).focus();
            element.find('#sendMessage').click(sendNewMessage);
            messages.scrollTop(messages.prop("scrollHeight"));

            $(document).on('click', '.self, .other', function () {
                $(this).toggleClass('showTime');
            });

            userInput.each(function () {
                this.setAttribute("style", `${this.scrollHeight + 2}px`);
            }).on("input", function () {
                this.style.height = (this.scrollHeight + 2) + "px";
            });
        } else {
            element = $('#therapistChat');
            element.addClass('enter');
            element.click(openElement);
        }
    }

    function openElement() {
        var messages = element.find('#chatMessages');
        var textInput = element.find('#chatbox');
        var userInput = $('#chatbox');
        element.find('>i').hide();
        element.addClass('expand');
        element.find('.chatContainer').addClass('enter');
        textInput.keydown(onMetaAndEnter).prop("disabled", false).focus();
        element.off('click', openElement);
        element.find('#closeChat').click(closeElement);
        element.find('#sendMessage').click(sendNewMessage);
        messages.scrollTop(messages.prop("scrollHeight"));


        $(document).on('click', '.self, .other', function () {
            $(this).toggleClass('showTime');
        });

        userInput.each(function () {
            this.setAttribute("style", `${this.scrollHeight + 2}px`);
        }).on("input", function () {
            this.style.height = (this.scrollHeight + 2) + "px";
        });
    }

    function closeElement() {
        element.find('.chatContainer').removeClass('enter').hide();
        element.find('#chatMsgIcon').show();
        element.removeClass('expand');
        element.find('#closeChat').off('click', closeElement);
        element.find('#sendMessage').off('click', sendNewMessage);
        element.find('#chatbox').off('keydown', onMetaAndEnter).prop("disabled", true).blur();
        setTimeout(function () {
            element.find('.chatContainer').removeClass('enter').show()
            element.click(openElement);
        }, 500);
    }

    if (window.location.pathname == '/thank-you') {
        document.getElementById('startSessionBtn').onclick = function () {
            if (document.body.clientWidth >= 992) {
                openElement();
            } else {
                window.location.href = '/chat-session';
            }
        }
    }

    /**
     * 
     * send the message from socket to the room and database.
     * 
     * @returns N/A if the newMessage is invalid.
     */
    function sendNewMessage() {
        var userInput = $('#chatbox');
        var newMessage = userInput.val().trim();
        if (!newMessage) {
            userInput.focus();
            return;
        }

        socket.emit('chat message', newMessage, orderId);
        var messagesContainer = $('#chatMessages');
        messagesContainer.append([
            `<li class="self" data-before="Sent at ${new Date().toLocaleString('en-CA', { hour: 'numeric', minute: 'numeric', hour12: true })}">`,
            newMessage,
            '</li>'
        ].join(''));

        userInput.val('');
        userInput.focus();

        $('#chatbox').each(function () {
            this.setAttribute("style", `${this.scrollHeight + 5}px`);
        });

        messagesContainer.finish().animate({
            scrollTop: messagesContainer.prop("scrollHeight")
        }, 500);
    }

    /**
     * 
     * This function sends the message if user presses CTRL + ENTER on their keyboard.
     * 
     * @param {*} e as event listener
     */
    function onMetaAndEnter(e) {
        if (e.ctrlKey && e.keyCode == 13) {
            sendNewMessage();
        }
    }

    /**
     * 
     * Change the status of the user (based on activity).
     * set status to 'offline' if the user is inactive.
     * 
     * @param {*} status as event listener.
     */
    function changeActiveState(status) {
        activeStates = document.querySelectorAll("#chatActiveState");
        activeStates.forEach(function (element) {
            element.innerHTML = status;
        })
    }
});