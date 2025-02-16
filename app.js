var refreshInterval;
var countdown;

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;
        fetch(`https://v6.bvg.transport.rest/locations/nearby?latitude=${lat}&longitude=${lon}&poi=false&addresses=false`)
            .then(response => response.json())
            .then(data => {
                var container = document.getElementById('container');
                var stationsDiv = document.createElement('div');
                stationsDiv.id = 'stationsSection';
                stationsDiv.innerHTML = '<h2>Stations found:</h2>';
                var stops = data.filter(function(item) {
                    return item.type === 'stop';
                });
                stops.forEach(function(station) {
                    var p = document.createElement('p');
                    p.textContent = station.name;
                    p.className = 'station';
                    p.addEventListener('click', function() {
                        console.log('Station clicked:', station.name, 'Station ID:', station.id);
                        stationsDiv.style.display = 'none';
                        clearInterval(refreshInterval);
                        fetchBusData(station.id);
                        refreshInterval = setInterval(function() {
                            fetchBusData(station.id);
                        }, 60000);
                        countdown = 60;
                        var countdownElement = document.getElementById('refreshCountdown');
                        countdownElement.id = 'countdownText';
                        countdownElement.textContent = 'Refreshing in ' + countdown + ' seconds';
                        var countdownInterval = setInterval(function() {
                            countdown--;
                            countdownElement.textContent = 'Refreshing in ' + countdown + ' seconds';
                            if (countdown === 0) {
                                countdown = 60;
                            }
                        }, 1000);
                    });
                    stationsDiv.appendChild(p);
                });
                container.appendChild(stationsDiv);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
} else {
    console.log("Geolocation is not supported by this browser.");
}

function fetchBusData(stationId) {
    fetch(`https://v6.bvg.transport.rest/stops/${stationId}/arrivals?duration=20`)
        .then(response => response.json())
        .then(data => {
            const arrivals = data.arrivals || [];
            
            var table = document.querySelector('#container table');
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            
            if (arrivals.length === 0) {
                var row = table.insertRow();
                var cell = row.insertCell();
                cell.colSpan = 4;
                cell.innerHTML = '<i>No upcoming arrivals</i>';
                return;
            }

            arrivals.forEach(function(bus) {
                var busLineNumber = bus.line.name;
                var finalDestination = bus.provenance || 'Unknown';
                var arrivalTime = new Date(bus.when);
                var currentTime = new Date();
                var timeDifference = Math.round((arrivalTime - currentTime) / 60000);
                var transportImage = bus.line.product + '.png';
                var row = table.insertRow();
                var cell1 = row.insertCell();
                var cell2 = row.insertCell();
                var cell3 = row.insertCell();
                var cell4 = row.insertCell();
                cell1.innerHTML = `<img src="${transportImage}" alt="Transport Image">`;
                cell2.innerHTML = `<b style="font-size: 1.5em;">${busLineNumber}</b>`;
                cell3.innerHTML = `<i>${finalDestination}</i>`;
                if (timeDifference === 0) {
                    cell4.innerHTML = '<b style="font-size: 1.5em;">now</b>';
                } else if (timeDifference < 0) {
                    cell4.innerHTML = '<b style="font-size: 1.5em;">departed</b>';
                } else {
                    cell4.innerHTML = `<b style="font-size: 1.5em;">${timeDifference}</b>`;
                }
            });
        })
        .catch(error => {
            console.error('Error:', error);
            var table = document.querySelector('#container table');
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            var row = table.insertRow();
            var cell = row.insertCell();
            cell.colSpan = 4;
            cell.innerHTML = '<i>Error loading arrival data</i>';
        });
}



document.getElementById('toggleButton').addEventListener('click', function() {
    var stationsSection = document.getElementById('stationsSection');
    if (stationsSection.style.display === 'none') {
        stationsSection.style.display = 'block';
    } else {
        stationsSection.style.display = 'none';
    }
});

document.getElementById('searchButton').addEventListener('click', function() {
    var searchQuery = document.getElementById('searchInput').value;
    var stationsSection = document.getElementById('stationsSection');
    stationsSection.style.display = 'block';
    searchStations(searchQuery);
});

function searchStations(query) {
    fetch(`https://v6.bvg.transport.rest/locations?poi=false&addresses=false&query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            var stationsDiv = document.getElementById('stationsSection');
            while (stationsDiv.firstChild) {
                stationsDiv.removeChild(stationsDiv.firstChild);
            }
            var header = document.createElement('h2');
            header.textContent = 'Search Results:';
            stationsDiv.appendChild(header);
            var stops = data.filter(function(item) {
                return item.type === 'stop';
            });
            stops.forEach(function(station) {
                var p = document.createElement('p');
                p.textContent = station.name;
                p.className = 'station';
                p.addEventListener('click', function() {
                    console.log('Station clicked:', station.name, 'Station ID:', station.id);
                    stationsDiv.style.display = 'none';
                    clearInterval(refreshInterval);
                    fetchBusData(station.id);
                    refreshInterval = setInterval(function() {
                        fetchBusData(station.id);
                    }, 60000);
                    countdown = 60;
                    var countdownElement = document.getElementById('refreshCountdown');
                    countdownElement.id = 'countdownText';
                    countdownElement.textContent = 'Refreshing in ' + countdown + ' seconds';
                    var countdownInterval = setInterval(function() {
                        countdown--;
                        countdownElement.textContent = 'Refreshing in ' + countdown + ' seconds';
                        if (countdown === 0) {
                            countdown = 60;
                        }
                    }, 1000);
                });
                stationsDiv.appendChild(p);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

