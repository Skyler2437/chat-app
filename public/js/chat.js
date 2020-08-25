const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $locationButton = document.querySelector('#send-location')

const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Autoscroll
const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    //Height of New Message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Container Height
    const containerHeight = $messages.scrollHeight

    //How Far Have I scrolled?
    const scrolledOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrolledOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

//When a new message is sent, display the message
socket.on('message', (message) => {

    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
        username: message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


//When a new location message is sent, display the message 
socket.on('locationMessage', (location) => {

    console.log(location.url)
    const html = Mustache.render(locationTemplate, {
        url: location.url,
        createdAt: moment(location.createdAt).format('h:mm a'),
        username: location.username

    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})


socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})



//sends a message from client to the server
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = $messageFormInput.value
    
    socket.emit('sendMessage', message, (error) => {
        $messageFormInput.value = ''
        $messageFormInput.focus()
        $messageFormButton.removeAttribute('disabled')
        if (error) {
            return console.log(error)
        }

        console.log('Message delivered.')
    })
})


//send a message of the user's location to the server
$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition( (position) => {
        socket.emit('location', {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }, () => $locationButton.removeAttribute('disabled')
        )
    })


})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})