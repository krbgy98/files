let today = new Date();
let year = today.getFullYear();
let month = String(today.getMonth() + 1).padStart(2, '0');
let day = String(today.getDate()).padStart(2, '0');
let formattedDate = year + month + day;

function generateApiUrl(type, league) {
  return `https://site.api.espn.com/apis/site/v2/sports/${type}/${league}/scoreboard?dates=${formattedDate}`;
}

async function fetchData(apiEndpoint, league, containerId) {
  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    processFixtures(data, league, containerId);
  } catch (error) {
    console.error(`Failed to fetch data for ${league}: ${error}`);
  }
}

function createEventHtml(homeTeam, awayTeam, leagueAbbreviation, match_URL, homeTeamScore, awayTeamScore, status, estTimeStr = '') { // Added estTimeStr parameter
  const homeTeamLogo = homeTeam.team.logo || '';
  const awayTeamLogo = awayTeam.team.logo || '';
  let scoreHtml = `<span class="score-text">${homeTeamScore} : ${awayTeamScore}</span>`;

  if (status === 'live') {
    scoreHtml = `<span class="score-text live">LIVE</span>`;
  } else if (status === 'pre') { // If status is 'pre', use estTimeStr
    scoreHtml = `<span class="score-text">${estTimeStr}</span>`; 
  }

  return `
    <div class="match-card" onclick="window.open('${match_URL}', '_blank')">
      <div class="team">
        <img class="team-logo" src="${homeTeamLogo}" alt="${homeTeam.team.displayName} Logo">
        <span class="team-name">${homeTeam.team.displayName}</span>
      </div>
      <div class="score">
        ${scoreHtml}
        <span class="score-ft">${status === 'live' || status === 'pre' ? '' : 'FT'}</span> 
      </div>
      <div class="team">
         
        <img class="team-logo" src="${awayTeamLogo}" alt="${awayTeam.team.displayName} Logo">
       <span class="team-name">${awayTeam.team.displayName}</span>
      </div>
    </div>
  `;
}

function processFixtures(data, leagueName, containerId) {
  const events = data.events;
  const leagueAbbreviation = data.leagues[0].abbreviation; 
  const container = document.querySelector(`#${containerId}`);
  if (!container) {
    console.error(`Container with id ${containerId} not found`);
    return;
  }
  container.innerHTML = '';

  const leagueNameHeading = document.createElement('h2');
  leagueNameHeading.textContent = leagueAbbreviation; 
  leagueNameHeading.classList.add('league-name'); 
  container.appendChild(leagueNameHeading);

  const liveEventsHtml = [];
  const finishedEventsHtml = [];
  const upcomingEventsHtml = []; // Array for upcoming events

  for (const event of events) {
    let status = 'ft';
    let estTimeStr = ''; // Initialize estTimeStr 

    if (event.status.type.state === "in" || event.status.type.description === "Halftime") {
      status = 'live';
    } else if (event.status.type.state === "pre") {
      status = 'pre';
      const eventDate = new Date(event.date);
      estTimeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Calculate time string if event is upcoming
    } 

    if ((event.status.type.state === "post" || status === 'live' || status === 'pre') && event.status.type.description !== "Postponed") {
      const homeTeam = event.competitions[0].competitors[0];
      const awayTeam = event.competitions[0].competitors[1];
      const homeTeamScore = homeTeam.score;
      const awayTeamScore = awayTeam.score;
      const match_URL = `https://v3.sportsurge.uno/#${homeTeam.team.shortDisplayName} vs ${awayTeam.team.shortDisplayName}`;

      const eventHtml = createEventHtml(homeTeam, awayTeam, leagueAbbreviation, match_URL, homeTeamScore, awayTeamScore, status, estTimeStr);

      if (status === 'live') {
        liveEventsHtml.push(eventHtml);
      } else if (status === 'pre') {
        upcomingEventsHtml.push(eventHtml); // Add to upcoming events array
      } else {
        finishedEventsHtml.push(eventHtml);
      }
    }
  }

  // Add upcoming events before finished events
  container.innerHTML += liveEventsHtml.join('') + upcomingEventsHtml.join('') + finishedEventsHtml.join(''); 

  if (liveEventsHtml.length === 0 && finishedEventsHtml.length === 0 && upcomingEventsHtml.length === 0) {
    container.style.display = "none";
  }
}

// Fetch data for each league
const leagues = [
{ id: 'UEFAChampionsLeague', name: 'UEFA.CHAMPIONS', type: 'soccer' },
    { id: 'UEFAEuropaLeague', name: 'UEFA.EUROPA', type: 'soccer' },
    { id: 'UEFAEuropaConferenceLeague', name: 'UEFA.EUROPA.CONF', type: 'soccer' },
    { id: 'EnglishPremierLeague', name: 'ENG.1', type: 'soccer' },
    { id: 'EnglishFACup', name: 'ENG.FA', type: 'soccer' },
    { id: 'EnglishCarabaoCup', name: 'ENG.LEAGUE_CUP', type: 'soccer' },
    { id: 'SpanishLaLiga', name: 'ESP.1', type: 'soccer' },
    { id: 'SpanishCopadelRey', name: 'ESP.COPA_DEL_REY', type: 'soccer' },
    { id: 'GermanBundesliga', name: 'GER.1', type: 'soccer' },
    { id: 'MLS', name: 'USA.1', type: 'soccer' },
    { id: 'ConcacafChampionsLeague', name: 'CONCACAF.CHAMPIONS', type: 'soccer' },
    { id: 'ItalianSerieA', name: 'ITA.1', type: 'soccer' },
    { id: 'FrenchLigue1', name: 'FRA.1', type: 'soccer' },
    { id: 'CoupedeFrance', name: 'FRA.COUPE_DE_FRANCE', type: 'soccer' },
    { id: 'MexicanLigaBBVAMX', name: 'MEX.1', type: 'soccer' },
    { id: 'EnglishLeagueChampionship', name: 'ENG.2', type: 'soccer' },
    { id: 'CoppaItalia', name: 'ITA.COPPA_ITALIA', type: 'soccer' },
    { id: 'SaudiKingsCup', name: 'KSA.KINGS.CUP', type: 'soccer' },
    { id: 'ScottishPremiership', name: 'SCO.1', type: 'soccer' },
    { id: 'ScottishCup', name: 'SCO.TENNENTS', type: 'soccer' },
    { id: 'LeaguesCup', name: 'CONCACAF.LEAGUES.CUP', type: 'soccer' },
    { id: 'MexicanLigadeExpansiónMX', name: 'MEX.2', type: 'soccer' },
    { id: 'MexicanCopaMX', name: 'MEX.COPA_MX', type: 'soccer' },
    { id: 'AustralianALeagueMen', name: 'AUS.1', type: 'soccer' },
    { id: 'CONMEBOLLibertadores', name: 'CONMEBOL.LIBERTADORES', type: 'soccer' },
    { id: 'TurkishSuperLig', name: 'TUR.1', type: 'soccer' },
    { id: 'InternationalFriendly', name: 'FIFA.FRIENDLY', type: 'soccer' },
    { id: 'FIFAWorldCup', name: 'FIFA.WORLD', type: 'soccer' },
    { id: 'FIFAWorldCupQualifyingCONMEBOL', name: 'FIFA.WORLDQ.CONMEBOL', type: 'soccer' },
    { id: 'FIFAWorldCupQualifyingConcacaf', name: 'FIFA.WORLDQ.CONCACAF', type: 'soccer' },
    { id: 'FIFAWorldCupQualifyingUEFA', name: 'FIFA.WORLDQ.UEFA', type: 'soccer' },
    { id: 'FIFAWorldCupQualifyingCAF', name: 'FIFA.WORLDQ.CAF', type: 'soccer' },
    { id: 'FIFAWorldCupQualifyingAFC', name: 'FIFA.WORLDQ.AFC', type: 'soccer' },
    { id: 'FIFAWorldCupQualifyingOFC', name: 'FIFA.WORLDQ.OFC', type: 'soccer' },
    { id: 'FIFAWorldCupQualifyingAFCCONMEBOLPlayoff', name: 'FIFA.WORLDQ.AFC.CONMEBOL', type: 'soccer' },
    { id: 'FIFAWorldCupQualifyingConcacafOFCPlayoff', name: 'FIFA.WORLDQ.CONCACAF.OFC', type: 'soccer' },
    { id: 'FIFAClubWorldCup', name: 'FIFA.CWC', type: 'soccer' },
    { id: 'ConcacafGoldCup', name: 'CONCACAF.GOLD', type: 'soccer' },
    { id: 'ConcacafGoldCupQualifying', name: 'CONCACAF.GOLD_QUAL', type: 'soccer' },
    { id: 'ConcacafNationsLeague', name: 'CONCACAF.NATIONS.LEAGUE', type: 'soccer' },
    { id: 'ConcacafNationsLeagueQualifying', name: 'CONCACAF.NATIONS.LEAGUE_QUAL', type: 'soccer' },
    { id: 'ConcacafCup', name: 'CONCACAF.CONFEDERATIONS_PLAYOFF', type: 'soccer' },
    { id: 'UEFAEuropeanChampionshipQualifying', name: 'UEFA.EUROPA_QUAL', type: 'soccer' },
    { id: 'UEFAEuropeanChampionship', name: 'UEFA.EURO', type: 'soccer' },
    { id: 'UEFANationsLeague', name: 'UEFA.NATIONS', type: 'soccer' },
    { id: 'CONMEBOLUEFACupofChampions', name: 'GLOBAL.FINALISSIMA', type: 'soccer' },
    { id: 'CopaAmérica', name: 'CONMEBOL.AMERICA', type: 'soccer' },
    { id: 'AFCAsianCup', name: 'AFC.ASIAN.CUP', type: 'soccer' },
    { id: 'AFCAsianCupQualifiers', name: 'AFC.CUPQ', type: 'soccer' },
    { id: 'AfricanNationsChampionship', name: 'CAF.CHAMPIONSHIP', type: 'soccer' },
    { id: 'AfricaCupofNations', name: 'CAF.NATIONS', type: 'soccer' },
    { id: 'AfricaCupofNationsQualifying', name: 'CAF.NATIONS_QUAL', type: 'soccer' },
    { id: 'AfricanNationsChampionshipQualifying', name: 'CAF.CHAMPIONSHIP_QUAL', type: 'soccer' },
    { id: 'WAFUCupofNations', name: 'WAFU.NATIONS', type: 'soccer' },
    { id: 'FIFAConfederationsCup', name: 'FIFA.CONFEDERATIONS', type: 'soccer' },
    { id: 'NonFIFAFriendly', name: 'NONFIFA', type: 'soccer' },
    { id: 'ScottishLeagueCup', name: 'SCO.CIS', type: 'soccer' },
    { id: 'SpanishLALIGA2', name: 'ESP.2', type: 'soccer' },
    { id: 'German2Bundesliga', name: 'GER.2', type: 'soccer' },
    { id: 'SwissSuperLeague', name: 'SUI.1', type: 'soccer' },
    { id: 'InternationalChampionsCup', name: 'GLOBAL.CHAMPS_CUP', type: 'soccer' },
    { id: 'NCAAMensSoccer', name: 'USA.NCAA.M.1', type: 'soccer' },
    { id: 'UEFAChampionsLeagueQualifying', name: 'UEFA.CHAMPIONS_QUAL', type: 'soccer' },
    { id: 'UEFAEuropaLeagueQualifying', name: 'UEFA.EUROPA_QUAL', type: 'soccer' },
    { id: 'UEFAEuropaConferenceLeagueQualifying', name: 'UEFA.EUROPA.CONF_QUAL', type: 'soccer' },
    { id: 'CONMEBOLUEFAClubChallenge', name: 'GLOBAL.CLUB_CHALLENGE', type: 'soccer' },
    { id: 'UEFASuperCup', name: 'UEFA.SUPER_CUP', type: 'soccer' },
    { id: 'SpanishSupercopa', name: 'ESP.SUPER_CUP', type: 'soccer' },
    { id: 'FrenchTropheedesChampions', name: 'FRA.SUPER_CUP', type: 'soccer' },
    { id: 'EnglishFACommunityShield', name: 'ENG.CHARITY', type: 'soccer' },
    { id: 'ItalianSupercoppa', name: 'ITA.SUPER_CUP', type: 'soccer' },
    { id: 'GermanDFLSupercup', name: 'GER.SUPER_CUP', type: 'soccer' },
    { id: 'AudiCup', name: 'GER.AUDI_CUP', type: 'soccer' },
    { id: 'DutchJohanCruyffShield', name: 'NED.SUPERCUP', type: 'soccer' },
    { id: 'ClubFriendly', name: 'CLUB.FRIENDLY', type: 'soccer' },
    { id: 'EmiratesCup', name: 'FRIENDLY.EMIRATES_CUP', type: 'soccer' },
    { id: 'MensOlympicTournament', name: 'FIFA.OLYMPICS', type: 'soccer' },
    { id: 'EnglishEFLTrophy', name: 'ENG.TROPHY', type: 'soccer' },
    { id: 'NBA', name: 'nba', type: 'basketball' },
    { id: 'MLB', name: 'mlb', type: 'baseball' },
    { id: 'NHL', name: 'nhl', type: 'hockey' },
    { id: 'NFL', name: 'nfl', type: 'football' },
];

for (const league of leagues) {
    const apiUrl = generateApiUrl(league.type, league.name);
    fetchData(apiUrl, league.name, league.id);
}




//  F1
const API_URLF1 = `https://site.api.espn.com/apis/site/v2/sports/racing/f1/scoreboard`;


async function getf1fixture() {
  const response = await fetch(`${API_URLF1}`);
  const data = await response.json();
  const events = data.events;
  console.log(events);
  let matchesFound = false;

  for (const event of events) {
   
      const nameofevent = event.shortName;
    const circuitfullname = event.circuit.fullName;
      const competitions = event.competitions;

      for (const competition of competitions) {
        if (competition.status.type.state !== "post") {
                  const eventDate = new Date(competition.date);
        const estTimeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const eventDayOfWeek = eventDate.getDay();
        const startTime = new Date(competition.date);
        const currentTime = new Date();

        const formula_URL = `https://v3.sportsurge.uno/#${nameofevent}`;
        if (competition.status.type.state === "pre") {
          const container = document.querySelector('#formula1');
          const teamContainer = document.createElement('div');

          teamContainer.innerHTML = `
          
      <div class="match-card row" onclick="window.open('${formula_URL}', '_blank')">
  <div class="col-1"> 
    <img class="team-logo" src="https://logos-world.net/wp-content/uploads/2023/12/F1-Logo.png" alt="f1 Logo">
  </div>
  <div class="col"> 
 ${nameofevent}
  </div>
<div id='timeofthematch' class="col-1">
  <td id='timetd' width='1%'><div id='time'></div></td>
 </div>
</div>
        `;

          // Countdown logic
          const countdownElement = teamContainer.querySelector('#time');
          const countdownDate = eventDate.getTime();

          function updateCountdown() {
            const currentTime = new Date().getTime();
            const distance = countdownDate - currentTime;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownElement.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;

            if (distance < 0) {
              clearInterval(countdownInterval);
              countdownElement.textContent = "Event Started!";
            }
          }

          updateCountdown();
          const countdownInterval = setInterval(updateCountdown, 1000);

          container.appendChild(teamContainer);
          matchesFound = true;
        } else if (competition.status.type.state === "in" || (competition.status.type.description === "Halftime")) {
          const container = document.querySelector('#formula1');
          const teamContainer = document.createElement('div');

          teamContainer.innerHTML = `
          
      <div class="match-card row" onclick="window.open('${formula_URL}', '_blank')">
  <div class="col-1"> 
    <img class="team-logo" src="https://logos-world.net/wp-content/uploads/2023/12/F1-Logo.png" alt="f1 Logo">
  </div>
  <div class="col"> 
 ${nameofevent}
  </div>
<div id='timeofthematch' class="col-1">
 <span class="live">LIVE NOW!</span>
 </div>
</div>
        
        `;

          container.appendChild(teamContainer);
          matchesFound = true;
        } else if (competition.status.type.state === "post") {
          const container = document.querySelector('#formula1');
          const teamContainer = document.createElement('div');

          teamContainer.innerHTML = `
          
          
      <div class="match-card row" onclick="window.open('${formula_URL}', '_blank')">
  <div class="col-1"> 
    <img class="team-logo" src="https://logos-world.net/wp-content/uploads/2023/12/F1-Logo.png" alt="f1 Logo">
  </div>
  <div class="col"> 
 ${nameofevent}
  </div>
<div id='timeofthematch' class="col-1">
    <span class="live">FINISHED!</span>
 </div>
</div>
    `;

          container.appendChild(teamContainer);
          matchesFound = true;
        }


         } 
      }
  
  }

  if (!matchesFound) {
    document.getElementById("formula1").style.display = "none";
  }
}

getf1fixture();


// ufc //

const API_mma = `https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard?dates=${formattedDate}`;
async function getmmafixture() {
  const response = await fetch(`${API_mma}`);
  const data = await response.json();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const league = data.leagues;
  const Slug = league[0].slug;
  const ufclogo = league[0].logos[0].href;
  const events = data.events;
  let matchesFound = false;
  for (const event of events) {
      if (event.status.type.description !== "Postponed"){
        const fightnight = event.name;
        const detail = event.status.type.detail;
        const eventId = event.id;
        const eventDate = new Date(event.date);
        const estTimeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });   
        const eventDayOfWeek = eventDate.getDay();
        const startTime = new Date(event.date);
        const currentTime = new Date();

        console.log(events);
  const mma_URL = `https://v3.sportsurge.uno/#${fightnight}`;
  if (event.status.type.state === "pre" ){
     const container = document.querySelector('#UFC');
    const teamContainer = document.createElement('div');
       
        teamContainer.innerHTML = `


      <div class="match-card row" onclick="window.open('${mma_URL}', '_blank')">
  <div class="col-1"> 
    <img class="team-logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UFC_Logo.svg/2560px-UFC_Logo.svg.png" alt="UFC Logo">
  </div>
  <div class="col"> 
${fightnight}
  </div>
<div id='timeofthematch' class="col-1">
   ${estTimeStr}
 </div>
</div>

`;
    container.appendChild(teamContainer); 
      
  }
if (event.status.type.state === "in" || (event.status.type.description === "Halftime")) {
        const container = document.querySelector('#UFC');
    const teamContainer = document.createElement('div');
       
        teamContainer.innerHTML = `
        
      <div class="match-card row" onclick="window.open('${mma_URL}', '_blank')">
  <div class="col-1"> 
    <img class="team-logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UFC_Logo.svg/2560px-UFC_Logo.svg.png" alt="UFC Logo">
  </div>
  <div class="col"> 
${fightnight}
  </div>
<div id='timeofthematch' class="col-1">
    <span class="live">LIVE NOW!</span>
 </div>
</div>
`;
    container.appendChild(teamContainer);
   
}
// لو الماتش خلص // 
 if (event.status.type.state === "post") {
    
    const container = document.querySelector('#UFC');
    const teamContainer = document.createElement('div');
       
        teamContainer.innerHTML = `

      <div class="match-card row" onclick="window.open('${mma_URL}', '_blank')">
  <div class="col-1"> 
    <img class="team-logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UFC_Logo.svg/2560px-UFC_Logo.svg.png" alt="UFC Logo">
  </div>
  <div class="col"> 
${fightnight}
  </div>
<div id='timeofthematch' class="col-1">
     <span class="live">FINISHED!</span>
 </div>
</div>
`;
    container.appendChild(teamContainer);
   
     
 }
 
matchesFound = true;
 
}
}
 //   IF NO MATCHES TODAY SHOW THIS CODE 
 if (!matchesFound) {document.getElementById("UFC").style.display = "none";}
}
getmmafixture()

// -- end mma fixtuers -- //



// Golf //
const apigolfPGA = `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates=${formattedDate}`;
const apigolfLPGA = `https://site.api.espn.com/apis/site/v2/sports/golf/lpga/scoreboard?dates=${formattedDate}`;
const apigolfChampionsTour = `https://site.api.espn.com/apis/site/v2/sports/golf/champions-tour/scoreboard?dates=${formattedDate}`;
const apigolfLIV = `https://site.api.espn.com/apis/site/v2/sports/golf/liv/scoreboard?dates=${formattedDate}`;

async function fetchGolfData(apiUrl) {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
}

async function processGolfData(data, containerId) {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const league = data.leagues;
  const events = data.events;
  let matchesFound = false;

  for (const event of events) {
    if (event.status.type.description !== "Postponed") {
      const eventname = event.name;
      const detail = event.status.type.detail;
      const eventId = event.id;
      const eventDate = new Date(event.date);
      const estTimeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });   
      const startTime = new Date(event.date);
      const currentTime = new Date();

      const golfurl = `https://v3.sportsurge.uno/#${eventname}`;
      const container = document.querySelector(`#${containerId}`);
      const teamContainer = document.createElement('div');
      let innerHTMLContent = `


      

  <div class="match-card row" onclick="window.open('${golfurl}', '_blank')">
  <div class="col-1"> 
    <span id='leaguenames'>${league[0].abbreviation}</span>
  </div>
  <div class="col"> 
${eventname}
  </div>
<div id='timeofthematch' class="col-1">
       ${estTimeStr}
 </div>
</div>
`;

      if (event.status.type.state === "pre") {
        teamContainer.innerHTML = innerHTMLContent;
      } else if (event.status.type.state === "in" || event.status.type.description === "Halftime") {
        innerHTMLContent = innerHTMLContent.replace(estTimeStr, '<span class="live">LIVE NOW!</span>');
        teamContainer.innerHTML = innerHTMLContent;
      } else if (event.status.type.state === "post") {
        innerHTMLContent = innerHTMLContent.replace(estTimeStr, '<span class="live">Final!</span>');
        teamContainer.innerHTML = innerHTMLContent;
      }

      container.appendChild(teamContainer);
      matchesFound = true;
    }
  }

  if (!matchesFound) {
    document.getElementById(containerId).style.display = "none";
  }
}

async function getGolfFixtures() {
  const pgaData = await fetchGolfData(apigolfPGA);
  await processGolfData(pgaData, 'GOLF_PGA');

  const lpgaData = await fetchGolfData(apigolfLPGA);
  await processGolfData(lpgaData, 'GOLF_LPGA');

  const championsTourData = await fetchGolfData(apigolfChampionsTour);
  await processGolfData(championsTourData, 'GOLF_CHAMPIONS_TOUR');

  const livData = await fetchGolfData(apigolfLIV);
  await processGolfData(livData, 'GOLF_LIV');
}

getGolfFixtures();
// end of golf // 



// indy racing //

const indyapi = `https://site.api.espn.com/apis/site/v2/sports/racing/irl/scoreboard?dates=${formattedDate}`;
async function getindy() {
  const response = await fetch(`${indyapi}`);
  const data = await response.json();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const league = data.leagues;
  const Slug = league[0].slug;
  const indylogo = league[0].logos[0].href;
  const events = data.events;
  let matchesFound = false;
  for (const event of events) {
      if (event.status.type.description !== "Postponed"){
        const indyrace = event.name;
        const detail = event.status.type.detail;
        const eventId = event.id;
        const eventDate = new Date(event.date);
        const estTimeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });   
        const eventDayOfWeek = eventDate.getDay();
        const startTime = new Date(event.date);
        const currentTime = new Date();

        console.log(events);
  const indyurl = `https://v3.sportsurge.uno/#${indyrace}`;
  if (event.status.type.state === "pre" ){
     const container = document.querySelector('#indy');
    const teamContainer = document.createElement('div');
       
        teamContainer.innerHTML = `

      <div class="match-card row" onclick="window.open('${indyurl}', '_blank')">
  <div class="col-1"> 
    <img class="team-logo" src="https://seeklogo.com/images/I/indycar-logo-9A45D4CB47-seeklogo.com.png" alt="UFC Logo">
  </div>
  <div class="col"> 
 ${indyrace}
  </div>
<div id='timeofthematch' class="col-1">
                ${estTimeStr}
 </div>
</div>
      `;
    container.appendChild(teamContainer); 
      
  }
if (event.status.type.state === "in" || (event.status.type.description === "Halftime")) {
        const container = document.querySelector('#indy');
    const teamContainer = document.createElement('div');
       
        teamContainer.innerHTML = `


      <div class="match-card row" onclick="window.open('${indyurl}', '_blank')">
  <div class="col-1"> 
    <img class="team-logo" src="https://seeklogo.com/images/I/indycar-logo-9A45D4CB47-seeklogo.com.png" alt="UFC Logo">
  </div>
  <div class="col"> 
 ${indyrace}
  </div>
<div id='timeofthematch' class="col-1">
           <span class="live">LIVE NOW!</span>
 </div>
</div>
    
`;
    container.appendChild(teamContainer);
   
}
// لو الماتش خلص // 
 if (event.status.type.state === "post") {
    
    const container = document.querySelector('#indy');
    const teamContainer = document.createElement('div');
       
        teamContainer.innerHTML = `

      <div class="match-card row" onclick="window.open('${indyurl}', '_blank')">
  <div class="col-1"> 
    <img class="team-logo" src="https://seeklogo.com/images/I/indycar-logo-9A45D4CB47-seeklogo.com.png" alt="UFC Logo">
  </div>
  <div class="col"> 
 ${indyrace}
  </div>
<div id='timeofthematch' class="col-1">
           <span class="live">FININSHED!</span>
 </div>
</div>`;
    container.appendChild(teamContainer);
   
     
 }
 
matchesFound = true;
 
}
}
 //   IF NO MATCHES TODAY SHOW THIS CODE 
 if (!matchesFound) {document.getElementById("indy").style.display = "none";}
}
getindy()


// -- end indy fixtuers -- //



// ufc new version//

const ufcmma = `https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard`;
const pflmma = `https://site.api.espn.com/apis/site/v2/sports/mma/pfl/scoreboard`;

async function getMMAFixtures() {
  const [ufcResponse, pflResponse] = await Promise.all([fetch(ufcmma), fetch(pflmma)]);
  const ufcData = await ufcResponse.json();
  const pflData = await pflResponse.json();

  const leagues = [...ufcData.leagues, ...pflData.leagues];
  const events = [...ufcData.events, ...pflData.events];
  const container = document.querySelector('#ufcmma');

  let matchesFound = false;

  for (const event of events) {
    if (event.status.type.description !== "Postponed") {
      const league = leagues.find(l => l.id === event.leagueId);
      const leagueName = league ? league.shortName : 'MMA';
      const fightnight = event.name;
      const eventDate = new Date(event.date);
      const estTimeStr = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const eventday = event.date.split('T')[0];
      const mma_URL = `https://v3.sportsurge.uno/#${fightnight}`;

      let statusHTML = '';
      if (event.status.type.state === "pre") {
        statusHTML = `${estTimeStr} - ${eventday}`;
      } else if (event.status.type.state === "in" || event.status.type.description === "Halftime") {
        statusHTML = `<span class="live">LIVE NOW!</span>`;
      } else if (event.status.type.state === "post") {
        statusHTML = `<span class="live">FINISHED!</span>`;
      }

      const teamContainer = document.createElement('div');
      teamContainer.innerHTML = `
      <div class="match-card row" onclick="window.open('${mma_URL}', '_blank')">
  <div class="col-1"> 
    <img class="team-logo" src="https://a.espncdn.com/combiner/i?img=/redesign/assets/img/icons/ESPN-icon-mma.png" alt="UFC Logo">
  </div>
  <div class="col"> 
${fightnight}
  </div>
<div id='timeofthematch' class="col-1">
                ${statusHTML}
 </div>
</div>
      `;
      container.appendChild(teamContainer);
      matchesFound = true;
    }
  }

  if (!matchesFound) {
    document.getElementById("ufcmma").style.display = "none";
  }
}

getMMAFixtures();
// end of new mma fixtures 






// 365SCORES JS CODE //
const fetchSportsData = async (apiUrl, containerId) => {
  let matchesFound = false;
  const response = await fetch(apiUrl);
  const data = await response.json();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const sports = data.games;
  const leagueName = data.competitions[0].name;
  const leagueSlug = data.competitions[0].nameForURL;
  const container = document.querySelector(`#${containerId}`);
  container.innerHTML = ''; // Clear the container before adding today's fixtures

  // Add the league name as a heading
  const leagueNameHeading = document.createElement('h2');
  leagueNameHeading.textContent = leagueName;
  leagueNameHeading.classList.add('league-name');
  container.appendChild(leagueNameHeading);

  const liveEventsHtml = [];
  const finishedEventsHtml = [];
  const scheduledEventsHtml = []; // Array for scheduled events

  // Render all scheduled and live games
  for (const sport of sports) {
    if (sport.statusText !== "Ended" && sport.statusText !== "WalkOver" && sport.statusText !== "Postponed" && sport.statusText !== "Final" && sport.statusText !== "Final (OT)" && sport.statusText !== "After Penalties" && sport.statusText !== "Postponed" && sport.statusText !== "Final (SO)" && sport.statusText !== "Final (Ex)" && sport.statusText !== "Abandoned") {
      const gameDate = new Date(sport.startTime);
      let status = 'ft';
      if (sport.statusText !== "Scheduled" && sport.statusText !== "Ended") {
        status = 'live';
      } else if (sport.statusText === "Scheduled") {
        status = 'scheduled'; // New status for scheduled games
      }

      if (
        gameDate.getDate() === today.getDate() &&
        gameDate.getMonth() === today.getMonth() &&
        gameDate.getFullYear() === today.getFullYear()
      ) {
        const estTimeStr = gameDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        matchesFound = true;
        const homeTeam = sport.homeCompetitor.name;
        const awayTeam = sport.awayCompetitor.name;
        const homeTeamScore = sport.homeCompetitor.score || 0;
        const awayTeamScore = sport.awayCompetitor.score || 0;
        const HLogo = sport.homeCompetitor.id;
        const ALogo = sport.awayCompetitor.id;
        const link = `https://v3.sportsurge.uno/#${homeTeam} vs ${awayTeam}`;

        let eventHtml = `
          <div class="match-card" onclick="window.open('${link}', '_blank')">
            <div class="team">
              <img class="team-logo" src="https://imagecache.365scores.com/image/upload/f_png,w_24,h_24,c_limit,q_auto:eco,dpr_3,d_Competitors:default1.png/v4/Competitors/${HLogo}" alt="${homeTeam} Logo">
              <span class="team-name">${homeTeam}</span>
            </div>
            <div class="score">
              ${status === 'live' ? '<span class="score-text live">LIVE</span>' 
               : status === 'scheduled' ? `<span class="score-text">${estTimeStr}</span>` 
               : `<span class="score-text">${homeTeamScore} : ${awayTeamScore}</span><span class="score-ft">FT</span>`}
            </div>
            <div class="team">
              
              <img class="team-logo" src="https://imagecache.365scores.com/image/upload/f_png,w_24,h_24,c_limit,q_auto:eco,dpr_3,d_Competitors:default1.png/v4/Competitors/${ALogo}" alt="${awayTeam} Logo">
              <span class="team-name">${awayTeam}</span>
            </div>
          </div>
        `;

        if (status === 'live') {
          liveEventsHtml.push(eventHtml);
        } else if (status === 'scheduled') {
          scheduledEventsHtml.push(eventHtml); // Add to scheduled events array
        } else {
          finishedEventsHtml.push(eventHtml);
        }
      }
    }
  }

  // Display live, then scheduled, then finished games
  container.innerHTML += liveEventsHtml.join('') + scheduledEventsHtml.join('') + finishedEventsHtml.join('');

  if (liveEventsHtml.length === 0 && finishedEventsHtml.length === 0 && scheduledEventsHtml.length === 0) {
    container.style.display = 'none';
  } else {
    container.style.display = '';
  }
};
// Example usage for multiple leagues
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=624', 'cafleague');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=7', 'premierleague');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=103', 'nba');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=6064', 'rio');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=366', 'nhl');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=11', 'laliga');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=35', 'ligue1');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=102', 'Libertadores');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=25', 'budesliga');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=17', 'seriaA');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=572', 'championsleague');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=573', 'europaleague');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=13', 'delray');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=104', 'mls');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=649', 'saudi');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=8', 'facup');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=141', 'ligamx');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=623', 'afc');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=438', 'mlb');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=275', 'rolandgarroswomen');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=209', 'rolandgarrosmen');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=215', 'wimbledonmen');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=230', 'usopenmen');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=183', 'australianopenmen');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=106', 'wnba');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=216', 'stuttgart');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=7842', 'valencia');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=213', 'hertogenbosch');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=240', 'madridopen');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=6316', 'euro2024');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=595', 'copa-america');
fetchSportsData('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=7244', 'nba-summer-leauge');
fetchSportsDataEvent('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=382', 'ncaaf');
fetchSportsDataEvent('https://webws.365scores.com/web/games/current/?appTypeId=5&competitions=352', 'nfl2');
