(function() {
    var widgetContainer = document.createElement('div');
    widgetContainer.id = 'chat-widget-container';
    document.body.appendChild(widgetContainer);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'path/to/chat_widget.html', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            widgetContainer.innerHTML = xhr.responseText;
            // Optionally, you could also execute the script tags from the fetched HTML here
        }
    };
    xhr.send();
})();
