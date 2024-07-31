const fetchSportsDataEvent = async (apiUrl, containerId) => {
    let matchesFound = false;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const Sports = data.games;
    const leagueName = data.competitions[0].name;
    const leagueSlug = data.competitions[0].nameForURL;
    const container = document.querySelector(`#${containerId}`);
    container.innerHTML = ''; // Clear the container before adding today's fixtures

    // Render all scheduled and live games
    for (const sport of Sports) {
        if (sport.statusText !== "Ended" && sport.statusText !== "WalkOver" && sport.statusText !== "Postponed" && sport.statusText !== "Final" && sport.statusText !== "Final (OT)" && sport.statusText !== "After Penalties" && sport.statusText !== "Postponed" && sport.statusText !== "Final (SO)" && sport.statusText !== "Final (Ex)" && sport.statusText !== "Abandoned") {
            const gameDate = new Date(sport.startTime);
            if (sport.statusText === "Scheduled") {
                if (
                    gameDate.getDate() === today.getDate() &&
                    gameDate.getMonth() === today.getMonth() &&
                    gameDate.getFullYear() === today.getFullYear()
                ) {
                    const estTimeStr = gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    matchesFound = true;
                    const homeTeam = sport.homeCompetitor.name;
                    const awayTeam = sport.awayCompetitor.name;
                    const HLogo = sport.homeCompetitor.id;
                    const ALogo = sport.awayCompetitor.id;
                    const link = `https://v3.sportsurge.uno/#${homeTeam} vs ${awayTeam}`;

                    const teamContainer = document.createElement('div');
                    teamContainer.innerHTML = `
                    <div class="row" onclick="window.open('${link}', '_blank')">
                        <div id='matchcard' class="col column mt-1">
                            <div class="row">
                                <div class="col-3">
                                    <span id='leaguenames'>${leagueName}</span>
                                </div>
                                <div id='afterleaguename' class="col-1"></div>
                                <div class="col-5">
                                    ${homeTeam} vs ${awayTeam}
                                </div>
                                <div id='timeofthematch' class="col-3">
                                    ${estTimeStr}
                                </div>
                            </div>
                        </div>
                    </div>
                    `;

                    container.appendChild(teamContainer);
                }
            }
            // If the game is live
            if (sport.statusText !== "Scheduled" && sport.statusText !== "Ended") {
                matchesFound = true;
                const homeTeam = sport.homeCompetitor.name;
                const awayTeam = sport.awayCompetitor.name;
                const HLogo = sport.homeCompetitor.id;
                const ALogo = sport.awayCompetitor.id;
                const hometeamscore = sport.homeCompetitor.score;
                const awayteamscore = sport.awayCompetitor.score;
                const minu = sport.gameTimeDisplay;
                const link = `https://v3.sportsurge.uno/#${homeTeam} vs ${awayTeam}`;

                const teamContainer = document.createElement('div');
                teamContainer.innerHTML = `<div class="row" onclick="window.open('${link}', '_blank')">
                    <div id='matchcard' class="col column mt-1">
                        <div class="row">
                            <div class="col-3">
                                <span id='leaguenames'>${leagueName}</span>
                            </div>
                            <div id='afterleaguename' class="col-1"></div>
                            <div class="col-5">
                                ${homeTeam} vs ${awayTeam}
                            </div>
                            <div id="timeofthematch" class="col-3">
                                <span class="live">LIVE NOW!</span>
                            </div>
                        </div>
                    </div>
                </div>`;

                container.appendChild(teamContainer);
            }

            // If the game is ended
            if (sport.statusText === "Ended" || sport.statusText === "Final" || sport.statusText === "Final (OT)" || sport.statusText === "After Penalties") {
                const homeTeam = sport.homeCompetitor.name;
                const awayTeam = sport.awayCompetitor.name;
                const HLogo = sport.homeCompetitor.id;
                const ALogo = sport.awayCompetitor.id;
                const hometeamscore = sport.homeCompetitor.score;
                const awayteamscore = sport.awayCompetitor.score;
                const minu = sport.gameTimeDisplay;
                const link = `https://v3.sportsurge.uno/#${homeTeam} vs ${awayTeam}`;

                const teamContainer = document.createElement('div');
                teamContainer.innerHTML = `<div class="row" onclick="window.open('${link}', '_blank')">
                    <div id='matchcard' class="col column mt-1">
                        <div class="row">
                            <div class="col-3">
                                <span id='leaguenames'>${leagueName}</span>
                            </div>
                            <div id='afterleaguename' class="col-1"></div>
                            <div class="col-5">
                                ${homeTeam} ${hometeamscore} : ${awayTeam} ${awayteamscore}
                            </div>
                            <div id='timeofthematch' class="col-3">
                                <div id="end"><strong>Full Time</strong></div>
                            </div>
                        </div>
                    </div>
                </div>`;

                container.appendChild(teamContainer);
            }
        }
    }

    if (!matchesFound) {
        container.style.display = 'none';
    } else {
        container.style.display = ''; // Ensure the container is visible if matches are found
    }
};

// Example usage for multiple leagues
fetchSportsDataEvent('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=7710', 'olympics');
fetchSportsDataEvent('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=8111', 'olympics-men');
fetchSportsDataEvent('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=6794', 'olympics-doubles');

