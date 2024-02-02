// Define a variable for the refresh interval and countdown
var refreshInterval;
var countdown;

// Check if Geolocation is supported
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        // Use fetch API to get data from the server
        fetch(`https://v5.bvg.transport.rest/stops/nearby?latitude=${lat}&longitude=${lon}`)
            .then(response => response.json())
            .then(data => {
                // Get the container div
                var container = document.getElementById('container');

                // Create a div to display the stations
                var stationsDiv = document.createElement('div');
                stationsDiv.id = 'stationsSection';
                stationsDiv.innerHTML = '<h2>Stations found:</h2>';

                // Loop through the data and add each station name to the div
                data.forEach(station => {
                    var p = document.createElement('p');
                    p.textContent = station.name;
                    p.className = 'station';
                    p.addEventListener('click', function() {
                        // Handle click event here
                        console.log('Station clicked:', station.name, 'Station ID:', station.id);
                        
                        // Hide the stationsSection when a station is clicked
                        stationsDiv.style.display = 'none';
                        // Clear any existing refresh interval
                        clearInterval(refreshInterval);

                        // Fetch bus arrival data when a station is clicked
                        fetchBusData(station.id);

                        // Set up the refresh interval to fetch new data every 60 seconds
                        refreshInterval = setInterval(function() {
                            fetchBusData(station.id);
                        }, 60000);

                        // Set up the countdown
                        countdown = 60;
                        var countdownElement = document.getElementById('refreshCountdown');
                        countdownElement.id = 'countdownText'; // Add this line
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

                // Append the div to the container
                container.appendChild(stationsDiv);
            })
            .catch(error => {
                // Handle the error here
                console.error('Error:', error);
            });
    });
} else {
    console.log("Geolocation is not supported by this browser.");
}

function fetchBusData(stationId) {
    fetch(`https://v5.bvg.transport.rest/stops/${stationId}/arrivals?duration=20`)
        .then(response => response.json())
        .then(data => {
            // Get the table from the HTML
            var table = document.querySelector('#container table');

            // Remove all rows except the header
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }

            // Loop through the data and extract the required information
            data.forEach(bus => {
                var busLineNumber = bus.line.name;
                var finalDestination = bus.provenance;
                var arrivalTime = new Date(bus.when);
                var currentTime = new Date();
                var timeDifference = Math.round((arrivalTime - currentTime) / 60000); // Convert to minutes

                // Determine the image based on the type of transport
                var transportImage = bus.line.product + '.png';

                // Create a new row and cells
                var row = table.insertRow();
                var cell1 = row.insertCell();
                var cell2 = row.insertCell();
                var cell3 = row.insertCell();
                var cell4 = row.insertCell();

                // Add the bus information to the cells
                cell1.innerHTML = `<img src="${transportImage}" alt="Transport Image">`;
                cell2.innerHTML = `<b style="font-size: 1.5em;">${busLineNumber}</b>`; // Make the line number bold and larger
                cell3.innerHTML = `<i>${finalDestination}</i>`; // Make the final destination italic

                // Check the time difference and modify the output accordingly
                if (timeDifference === 0) {
                    cell4.innerHTML = '<b style="font-size: 1.5em;">now</b>'; // Make the time bold
                } else if (timeDifference < 0) {
                    cell4.innerHTML = '<b style="font-size: 1.5em;">departed</b>'; // Make the time bold
                } else {
                    cell4.innerHTML = `<b style="font-size: 1.5em;">${timeDifference}` + '`</b>'; // Make the time bold
                }

            
            });
        })
        .catch(error => {
            // Handle the error here
            console.error('Error:', error);
        });
}

document.getElementById('toggleButton').addEventListener('click', function() {
    var stationsSection = document.getElementById('stationsSection'); // Use the correct ID here
    if (stationsSection.style.display === 'none') {
        stationsSection.style.display = 'block';
    } else {
        stationsSection.style.display = 'none';
    }
});

document.getElementById('searchButton').addEventListener('click', function() {
    var searchQuery = document.getElementById('searchInput').value;
    
    // Unhide the stationsSection when the search button is clicked
    var stationsSection = document.getElementById('stationsSection');
    stationsSection.style.display = 'block';

    searchStations(searchQuery);
});

function searchStations(query) {
    fetch(`https://v5.bvg.transport.rest/locations?query=${query}&type=stop`)
        .then(response => response.json())
        .then(data => {
            // Clear the stationsDiv
            var stationsDiv = document.getElementById('stationsSection');
            while (stationsDiv.firstChild) {
                stationsDiv.removeChild(stationsDiv.firstChild);
            }

            // Loop through the data and add each station name to the div
            data.forEach(station => {
                var p = document.createElement('p');
                p.textContent = station.name;
                p.className = 'station';
                p.addEventListener('click', function() {
                    // Handle click event here
                    console.log('Station clicked:', station.name, 'Station ID:', station.id);

                    // Hide the stationsSection when a station is clicked
                    stationsDiv.style.display = 'none';

                    // Clear any existing refresh interval
                    clearInterval(refreshInterval);

                    // Fetch bus arrival data when a station is clicked
                    fetchBusData(station.id);

                    // Set up the refresh interval to fetch new data every 60 seconds
                    refreshInterval = setInterval(function() {
                        fetchBusData(station.id);
                    }, 60000);

                    // Set up the countdown
                    countdown = 60;
                    var countdownElement = document.getElementById('refreshCountdown');
                    countdownElement.id = 'countdownText'; // Add this line
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
            // Handle the error here
            console.error('Error:', error);
        });
}