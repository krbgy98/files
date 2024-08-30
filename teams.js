const GeorgiaTech = `https://webws.365scores.com/web/games/current/?appTypeId=5&competitors=6641`;
const michigan = `https://webws.365scores.com/web/games/current/?appTypeId=5&competitors=6598`;
async function fetchDataTeams(url) {
    const response = await fetch(url);
    return response.json();
}

async function getTeamMatches(url, containerId) {
    let matchesFound = false;
    const data = await fetchDataTeams(url);
    const matches = data.games;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const today = new Date();

    const container = document.querySelector(`#${containerId}`);
    container.innerHTML = ''; // Clear the container before adding today's fixtures

    for (const match of matches) {
        if (match.statusText !== "Ended" && match.statusText !== "Postponed" && match.statusText !== "Final") {
            const gameDate = new Date(match.startTime);
            const estTimeStr = gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const leagueName = match.competitionDisplayName;
            const homeTeam = match.homeCompetitor.name;
            const awayTeam = match.awayCompetitor.name;
            const HLogo = match.homeCompetitor.id;
            const ALogo = match.awayCompetitor.id;
            const matchDateFormatted = gameDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            const minu = match.gameTimeDisplay;
            const gameID = match.id;
            const link = `https://v3.sportsurge.uno/#${homeTeam} vs ${awayTeam}`;

            let teamContainer = document.createElement('div');
            if (match.statusText === "Scheduled") {
                // Display the match details for scheduled matches
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
                                ${estTimeStr} <strong>${matchDateFormatted}</strong>
                            </div>
                        </div>
                    </div>
                </div>`;
            } else {
                // Display the match details for live matches
                matchesFound = true;
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
                            <div id="timeofthematch" class="col-3">
                                <span class="live">LIVE NOW!</span>
                            </div>
                        </div>
                    </div>
                </div>`;
            }
            container.appendChild(teamContainer);
        }
    }
}

getTeamMatches(GeorgiaTech, 'GeorgiaTech');
getTeamMatches(michigan, 'michigan');
