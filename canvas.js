/*-------------- Notes --------------------------------------------------------------------------------------------------------------------
Zooming out/in of the page and then refreshing it leads to objects becomes smaller/bigger (press "ctrl" + "+" and "ctrl" + "-").
It increases screen the inner width and height of the window which leads to the entire canvas element having more pixels and
the size of object is determened throught pixels. So zooming out makes all objects smaller while zooming in makes them larger. 

v2: powerupps ex add player life
    duengeon
    circles orbiting the sides to prevent corner camping, or rather make it harder

-----------------------------------------------------------------------------------------------------------------------------------------*/
// Canvas deklareras
var canvas = document.querySelector("canvas")
var c = canvas.getContext("2d")

// Variabler på canvas elementets höjd och bred så att det blir mindre att skriva när obeject skapas och så att det blir enklare att ändra
var chosenWidth = window.innerWidth - 20    // - 20 så att scrollbaren inte täker en del av canvas elementet
var chosenHeight = window.innerHeight -30   // - 30 så att texten under canvas (ex player life) och canvas elementet syns samtidigt 
//
canvas.width = chosenWidth
canvas.height = chosenHeight

// variabler deklareras här, det kan vara bra att ha default värdena nedskrivna om man kanske vill ändra något snabbt och komma ihåg utsprungsvärdena
//
// spelarens
var X_Korrdinat                                 // spelarens X korrdinat                    Värde anges i frame_PreSets()
var Y_Korrdinat                                 // spelarens Y korrdinat                    Värde anges i frame_PreSets()
var Speed = 5                                   // spelarens hastighet                      Default: 5
var keys = []                                   // håller koll på användarinput             Default: none
var player_radius = 10                          // spelarens radius                         Default: 10
var players_boundaries = player_radius + 2      // out of bounds check, ökas med 2 för att hela spelarobejectet ska synas   Default: player_radius + 2
var player_color = "yellow"                     // spelarens färg                           Default: "yellow"
var player_life_amount                          // antal gånger spelaren får bli träffad    Värde anges i frame_PreSets()
var player_lineWidth = 3                        // spelarens circles tjocklek               Default: 3
//
// circlarna
var circleArray = []                            // håller koll på motståndarobeject         Default: none
var circle_radius = 30                          // circlarnas radius                        Default: 30
var circle_Starting_Amount = 10                 // startens antal circelmotståndaobeject    Default: 10
var circle_color = "blue"                       // circlarnas färg                          Default: "blue"
var circle_MaxSpeed = 2.5                       // circlarnas högsta hastighet              Default: 2.5
var circle_spawnRate = 150                      // hur ofta circlarna genereras             Default: 150
var circle_lineWidth = 3                        // circlarnas tjocklek                      Default: 3
//
// misc
var timer                                       // håller koll på tiden
var i                                           // variabel som används för att updatera circklaran i en for loop
var k                                           // används när circelobeject tas bort
var isRunning = true                            // används för att starta och stoppa requestAnimationFrame
var highScore = 0                               // håller koll på highscore
var newGame = false                             // används för att resetta highscore när preseten ändras
var userInput                                   // används när spelaren ska ändra preset
//
// används när circlar genereras i "generate_circle()"
var radius                                      // radius
var x                                           // x korrdinat
var y                                           // y korrdinat
var dx                                          // hastighet i x-led
var dy                                          // hastighet i y-led
//
// grafiska presets, gör spelet lite mer levande liksom.
//
c.shadowColor = "white"                         // lysande färg                             Default: "white"
c.globalCompositeOperation = "lighter"          // lägger till lite extra lysning           Default: "lighter"
c.shadowBlur = 10                               // blur                                     Default: "10"

//--------------------------------------------------------------- Startfunktion ------------------------------------------------------------

// när sidan laddats in körs programmet igång för att undivka fel
window.onload = function(){

    // lysnar efter användarinput
    document.body.addEventListener("keydown", function (e) {
        keys[e.keyCode] = true;
    })
    document.body.addEventListener("keyup", function (e) {
        keys[e.keyCode] = false;
    })

    // För att kunna använda piltangenterna för att röra spelaren på ett bekvämt sätt behöver man ta bort dess scroll effekt
    // eftersom scroll i x-led är bortagen så inkluderar denna funktion bara upp och ner
    // space blockeras även som används för att pausa sidan
    window.addEventListener("keydown", function(e) {
        if([38, 40, 32].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

    // några presets, inkluderar att starta spelet genom att sätta "isRunning = true"
    frame_PreSets()

    // startar programmet
    frame()
}

//--------------------------------------------------------------- Spelarobejectet -------------------------------------------------------

// denna funktion tar hand om spelarens input och gör det till rörelse
function player_movement(){

    // huvudelen
    //
    // up , w
    if (keys[38] || keys[87]) {
        Y_Korrdinat -= Speed
    }
    // down, s
    if (keys[40] || keys[83]) {
        Y_Korrdinat += Speed
    }
    // right, d
    if (keys[39] || keys[68]) {
        X_Korrdinat += Speed
    }
    // left, a
    if (keys[37] || keys[65]) {
        X_Korrdinat -= Speed
    }

    // Misc delen
    //
    // restart (r)
    if (keys[82]){
        endGame()
    }
    // change preset (F)
    if (keys[70]){
        preset_prompt()
    }
    // pausar spelet (space)
    if (keys[32]){
        pauseGame()
    }
}

// spelaren får inte röra sig utanför canvas elementet, följande undviker detta
// i förra funktionen ökas / minskas x och y korrdinaterna, om de är för stora / för små så sätts de till sin maximun / minmum värde
function player_out_of_bounds_check(){

    // för X korrdinat
    //
    // höger
    if (X_Korrdinat >= chosenWidth - players_boundaries) {
        X_Korrdinat = chosenWidth - players_boundaries
    }
    // vänster
    else if (X_Korrdinat <= players_boundaries) {
        X_Korrdinat = players_boundaries
    }

    // för Y korrdinat
    //
    // ner
    if (Y_Korrdinat > chosenHeight - players_boundaries) {
        Y_Korrdinat = chosenHeight - players_boundaries
    }
    // upp
    else if (Y_Korrdinat <= players_boundaries) {
        Y_Korrdinat = players_boundaries
    }
}

// denna funktion ritar spelarobejectet
function draw_player_object(){
    c.strokeStyle = player_color
    c.lineWidth = player_lineWidth

    c.beginPath()
    c.arc(X_Korrdinat, Y_Korrdinat, player_radius, 0, 2 * Math.PI, false)
    c.stroke()
    c.closePath()
}

// sätter alla spelarfunctionerna i en och anropas i huvudfunktionen
function player_update(){
    player_movement()               // spelarens rörelse
    player_out_of_bounds_check()    // out of bounds check
    draw_player_object()            // spelaren ritas
}

// om spelaren blir träffad anropas denna funktion
function player_hit(){
    // spelarens antal liv och dess motsvarande värde på skrämen updateras
    player_life_amount -= 1
    document.getElementById("P_Life").innerText = player_life_amount

    // circeln i kontakt tas bort från listan och motsvarande variabel tas bort
    circleArray.splice(i, 1)
    document.getElementById("C_amount").innerText = circleArray.length

    // variabel som används i circle_movement()
    k += 1

    // denna funktion körs på varje circel en i taget så vi behöver oroa oss om att spelaren kanske blir träffad av två obeject sammtidigt
    // därför behöver vi inte ha "if(player_life_amount <= 0)" utan kan ha detta
    if (player_life_amount == 0){
        endGame() // avslutar spelet
    }
}

//--------------------------------------------------- Motståndarobeject ---------------------------------------------------------------

// tar hand om det mesta för circlarna
function Circle(x, y, dx, dy, radius){
    // construerar en circel med argumentet, i princip en klass
    this.x = x
    this.y = y
    this.dx = dx
    this.dy = dy
    this.radius = radius

    // ritar circeln
    this.draw = function(){
        c.strokeStyle = circle_color
        c.lineWidth = circle_lineWidth

        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false)
        c.stroke()
        c.closePath()
    }

    // testar om spelaren och denna circel nuddar varandra, varabelerna "X_Korrdinat, Y_Korrdinat och player_radius" anger utrymmet spelaren upptar
    // använder pyth. sats för att avgöra detta
    this.hitdetecton = function (){
        
        var V1 = Math.sqrt( Math.pow(this.x - X_Korrdinat, 2) + Math.pow(this.y - Y_Korrdinat, 2) ) // distans mellan spelare och circelobeject
        var V2 = player_radius + this.radius // accepterad distans mellan spelare och fiendeobejectet

        // om distansen mellan de 2 och deras radier tillsammans så är de i kontakt
        if (V1 < V2){
            player_hit()
        }
    }
    
    // rörelse, det är denna funktion som anropas när circlarna ska updateras, så resten av funktionerna innom här anropas också här
    this.update = function(){
        // om circeln kommer i kontakt med kanten ska den studsa bort från den, då vänder vi deras hastighet
        // exempel om circeln nuddar toppen av skärmen så vill vi att dess hastighet uppåt ska gå neråt istället, det blir som att den studsar
        //
        // för x
        if (this.x + this.radius > chosenWidth || this.x - this.radius < 0){
            this.dx = -this.dx
        }
        // för y
        if (this.y + this.radius > chosenHeight || this.y - this.radius < 0){
            this.dy = -this.dy
        }

        // sedan läggs hastigheten på x och y korrdinaten för att få rörelse
        this.x += this.dx
        this.y += this.dy

        // ritar circeln
        this.draw()

        // testar om spelaren kolliderar med detta obeject
        this.hitdetecton()
    }
}

// generarar en circel, Circkelns attriuter slumpas ut innom vissa tillstånd
function generate_circle(){
    radius = circle_radius

    // för att undvika att circlarna skapas på spelarens position och ge spelaren mer tid att reagera
    // detta görs bara i x-led eftersom om x-korrdinaterna inte är lika så kommer de inte kollidera ovasett y-korrdinatens värde
    // ingen del av circlarna får heller vara utanför canvas elementet villket är varför radiusen är refererad när dessa ska genereras
    //
    // om spelaren är på vänster sida av canvas elementet så blir circelns x-korrdinat längst till höger
    if (X_Korrdinat < chosenWidth / 2){
        x = chosenWidth - radius
    }
    // anars så blir det längst till vänster
    else{
        x = radius
    }
    // slumpar ut y-korrdinaten i hela y-led
    y = Math.random() * (chosenHeight - 2 * radius) + radius

    // genom att ta math.random() - 0.5 kan ge ett alltingen ett negativt tal eller ett posetivt tal
    // så då kan circeln starta med rörelse i mot alla riktningar,
    // det multipliseras med 2 så att det blir lättare att med spelarens hastighet
    dx = circle_MaxSpeed * 2 * (Math.random() - 0.5)
    dy = circle_MaxSpeed * 2 * (Math.random() - 0.5)

    // lägger till circlarna i en array
    circleArray.push(new Circle(x, y, dx, dy, radius))

    // updaterar displayn med antal circlar
    document.getElementById("C_amount").innerText = circleArray.length
}

// anropar circle.update för varje circel
function circle_movement(){
    k = 0
    // "k" är antalet circlar som har raderats, används eftersom conditions i loopar inte verkar kunna ändras när de är aktiva
    // när ett obeject blir "spliced" så försvinner den ur listan villket leder till att alla listpositionerna blir framflyttade ett steg
    // detta skulle leda till att programmet skulle försöka updatera ett obeject som inte fanns villket hade lett till fel då den uppdaterar
    // den sista positionen
    // "k" används för att hindra detta
    //
    // när en circel har raderats så kommer vi då också att gå tillbaka ett steg i listuppdateringen villket också är var circeln
    // näst i tur är då den flyttat fram ett steg i listan och "k" gör så att vi går ett steg tillbaka i den
    for(i = 0; i < circleArray.length; i++){
        circleArray[i - k].update()
    }
}

// circlarna genereras linjärt, vi har ett startvärde med circlar ("circle_startingAmount()") och
// en konstant ökning ("add_circle()"), så det blir en y = kx + m funktion av det
//
// genererar startvärdet av circlarna, variabeln "circle_amount" bestämmer hur många
function circle_startingAmount(){
    for (var i = 0; i < circle_Starting_Amount; i++){
        generate_circle()
    }
}
//
// lägger till circlar i en konstant hastighet
function add_circle(){
    // om timer / circle_spawnRate går jämt ut (saknar decimaler) genereras en circel
    if (timer % circle_spawnRate == 0){
        generate_circle()
    }
}

//---------------------------------------------------- Huvudfunktioner ------------------------------------------------------------------

// några presets som behöver omdeklareras varje gång spelet startas om
function frame_PreSets(){

    timer = 0
    X_Korrdinat = chosenWidth / 4                                               // Default: chosenWidth / 4
    Y_Korrdinat = chosenHeight / 2                                              // Default: chosenHeight / 2          
    player_life_amount = 5                  // spelarens liv resetas            // Default: 5
    circleArray = []                        // tar bort alla aktiva cirklar
    keys = []                               // tar bort eventuell användarinput för att undivka fel som att spelarenobejectet rör sig av sig själv 

    // genererar startantalet circelmotståndaobeject
    circle_startingAmount()

    // uppdaterar antalet spelarliv i texten
    document.getElementById("P_Life").innerText = player_life_amount

    isRunning = true                        // startar spelet
}

// huvudfunktionen
function frame(){
    // updaterar spelet 50 gånger / sec on "isRunning = true"
    if (isRunning == true){
        requestAnimationFrame(frame) 
    }

    // jag har fått en kommentar att det är problematiskt att öka en variabel hela tiden,
    // men att använda exempelvis javascript time hade gjort så att det hade blivit flera problem om spelet laggar lite för användaren
    // då fler circlar hade skapats jämfört med resten av spelet
    // detta sättet gör så att spelet alltid kommer att vara lika ovasett hur långsamt det körs
    timer += 1

    // score uppdateras
    document.getElementById("P_score").innerText = timer / 50

    c.clearRect(0, 0, chosenWidth, chosenHeight) // rensar hela canvas elementet

    add_circle() // lägger till eventuella fiendeobeject
    
    player_update() // tar hand om spelaren

    circle_movement() // rör på circlarna
}

// stoppar spelet
function endGame(){
    // stopparspelet
    isRunning = false

    // om spelets preset ändras så ska highscore resetas
    if (newGame == true){
        newGame = false
        highScore = 0
        document.getElementById("H_score").innerText = highScore
    }
    else{
        // updaterar highscore om det förbättrats
        if (highScore < timer / 50){
            highScore = timer / 50
            document.getElementById("H_score").innerText = highScore
        }
    }

    // presets, omdeklarerar allt som behövs, exempelvis variabler, arrays, score
    frame_PreSets() // startar även spelet, när isRunning = true så går spelet igång igen
}

// -------------------------------- Presets + prompt för ändring + pause ----------------------------------------------------------

// denna funktion gör "preset_prompt" betydligt mer kompact
// det gick inte att ha "else if" på denna funktion även om det är ett if statmeant först i preset_prompt,
// så jag prioriterade att ha programmet kompact över att ha det optimalt här
// inputs med "numer" + "." accepteras också pga att det är så det står i listan med alternativen för att undvika förrviring
function preset_maker(thisNumber, CRadius, SAmount, color, MSpeed, SRate){
    // funktionen testar om användarens input matchar ett presets nummer eller färg
    if (userInput == thisNumber || userInput == color || userInput == thisNumber + "."){
        // om det blir matchat så ändras några inställningar till argumenten
        circle_radius = CRadius
        circle_Starting_Amount = SAmount
        circle_color = color
        circle_MaxSpeed = MSpeed
        circle_spawnRate = SRate

        newGame = true // används för att veta om spelet ska starta ett nytt spel
    }
}

// denna funktion tar användarinput och gör om det till en preset
function preset_prompt(){
    // tar användarinput som en prompt
    userInput = prompt('Skriv in vilket "mode" du vill köra i. Svarsalternativen finns längre ner under rubriken “Input”.')
    userInput = userInput.toLocaleLowerCase() // om inputen har stora bokstäver görs det om till små
 
    preset_maker(1, 30, 10, "blue", 2.5, 150)
    preset_maker(2, 30, 15, "cyan", 7.5, 250)
    preset_maker(3, 30, 10, "purple", 10, 250)

    preset_maker(4, 10, 25, "darkgreen", 4, 100)
    preset_maker(5, 10, 50, "lime", 2, 50)
    preset_maker(6, 10, 100, "white", 0.5, 40)

    preset_maker(7, 10, 20, "brown", 5, 50)
    preset_maker(8, 10, 20, "red", 7.5, 50)
    preset_maker(9, 10, 20, "hotpink", 10, 50)
    preset_maker(10, 5, 10, "darkslategrey", 7.5, 10)
    
    // om anändarinputen har godkänts så startas spelet om med den valda preseten, då newGame är satt till true
    if (newGame == true){
        endGame()
    }
    // anars så fortsätter bara spelet där den avslutades
    else{
        alert('Input matchade inte något svarsaternativ, tryck "F" efter att ha stängt detta fönster för att försöka igen')
        keys = []   // tömmer användarinputen så att denna funktion inte anropas så fort alertboxen stängs 
    }
}

// bara för att jag kan la jag till en pause funktion
function pauseGame(){
    alert("spelet har pausats")
    keys = []
}