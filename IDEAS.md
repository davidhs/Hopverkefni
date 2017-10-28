# Hugmyndir

## Leikjahönnun

* https://en.wikipedia.org/wiki/Game_design

### Leikreglur...

* Á leikurinn að hafa quest/verkefni/missions/goal?

    * **Daníel:** Gætum skoðað það að hafa waves, sem verða alltaf erfiðar og erfiðar. Frekar easy að implementa og kominn survival fýlingur. Getum einnig leyft spilaranum að velja milli survival eða eitthvað annað.

### Á leikurinn að samanstanda af mismunandi borðum?

**Daníel:** Væri mega töff að hafa mismunandi borð, sjáum hvernig það gengur með fyrsta borðið. Ef það gengur vel getum við bætt við endalaust of borðum. :)

**Alexander**:
  Mín skoðun er sú að þetta ætti að vera eitt stórt map, sem er endalaust og
  verður erfiðara með tímanumm, s.s. fleiri óvinir í einu og erfiðari

#### Er hægt að fara úr einu borði yfir í annað og aftur til baka eins oft og manni sýnist?

* **Daniel:** Ekki með neina skoðun. :)

#### Getur hvert borð samanstaðið af mismunandi hæðum?

* **Daníel:** Hef ekki kynnt mér þetta næginlega vel.

#### "Open-world"?

* **Daníel:** Ok það er verið að hugsa út fyrir kassann, love it! Davíð ertu með e-h hugmynd hvernig það væri gert með generator?

#### Procedurally generated
  
#### Óvinir/NPC í leiknum?

* **Alexander:**
        Dæmi um óvini: Terrorist, eða óvinur sem reynir að hlaupa að þér og sprengja sig, sprengjan
        er með áhveðin radíus, ef þú skítur hann springur hann líka í sama radíus og
        óvinir meiðast líka af sprenginunni.

* **Daníel:** Mjög töff hugmynd. Getum haft óvini mis hraða, mis sterka etc. Og að hafa NPC gæti verið töff til að hafa fleiri "element" í leiknum. NPC sem selur vopn, annar sem selur powerups etc. Klárlega skoða þetta betur!
 
### Resource-ar í leiknum

* Líf (HP)?
* Peningur?
* XP
* Mismunandi vopn í leiknum?

    * **Alexander:** Ef það væru crates sem þú getur fundið og fengið mismundandi vopn sem eru með x mikið ammo, svo er defult bissan alltaf með infinit ammo.

    * **Daníel:** Væri geggjað að hafa crates, með X% drop chance á e-h úrvali af vopnum. Getum látið ívini gefa stig og $. Gætum skoðað það að hafa buy takka sem stoppar leikinn og maður getur keypt powerups?

### Hægt að svindla?

**Daníel:** Getum gert það. Ótrúlega easy að bæta inní og strax orðið svona "öðruvísi" og klárlega plús í kladdann.

## Tækni

### Hljóð

* Ef hljóðgjafi er langt í burtu frá karakternum á þá að lækka í því?  Eða ef hljóðgjafinn er fyrir aftan vegg.

    * **Daníel:** Okey, geggjuð hugmynd! Er einhver með hugmynd hvernig væri best að innleiða þetta?

### AI

**Daníel:** Byrjum á algjörri dummy AI. Epic ef við náum að gera e-h betra! Nema þið séuð með e-h pælingar, ég var bara að pæla í að láta óvini "elta" með að uppfæra cords +/- cords á player.

### Pathfinding

* https://en.wikipedia.org/wiki/Pathfinding
* https://en.wikipedia.org/wiki/Navigation_mesh

#### Vandamál:
* Ef maður skiptir borðinu upp í net þar sem leggur liggur milli hvers aðliggjandi hnúts upp/niður, hægri/vinstri og skáhallt, þá ef NPC fylgir leið í gegnum netið sem t.d. Dijkstra eða A* reikniritið gefur þá er sú leið jagged (sagtennt?).
* http://www.valvesoftware.com/publications/2009/ai_systems_of_l4d_mike_booth.pdf

    * **Daniel:** Skal kíkja á þetta, sjá hvað ég finn.

### Collision detection/handling

**Daníel:** Erum við að gera detection fyrir eitthvað sem hreyfist f. utan skotin? 

### Shadows

* https://en.wikipedia.org/wiki/Ray_casting
* http://ncase.me/sight-and-light/

### Lighting

Hægt að nota sambærilega ray casting aðferð og notað er til að búa til skugga.

### Multiplayer (mæli ekki með)

**Davíð:**
Ég mæli ekki með multiplayer.  Ég var að skoða hvernig það hefur verið útfært.  Ef maður ætlar að útfæra leikinn svo hann bjóði upp á multiplayer þá þarf að gera ráð fyrir því frá upphafi og hanna leikinn með tillit til þess.

Vandamál sem maður lendir í:

* Það er mismikið latency milli hverra véla og servera.  Klukkur slá ekki á sama hraða / í sama fasa og aðrar vélar, á endanum er tíminn mismunandi milli véla, sem þyrfti að samstilla (https://en.wikipedia.org/wiki/Clock_synchronization).  

* Það er latency milli notandan og server/notanda.  Þetta getur verið óhemju mikið í rauntímaleikjum, hvað þá ef það er rosalega mikið að gerast á hverri stundu.

  * T.d. ef maður smellir á músahnapp til að skjóta, þá væri hægt að senda þessa skipun sem skilaboð á þjóninn. Þjóninn sendir svo skilaboð til baka hvort maður megi halda áfram með þessa skipunina.  Eða þjónninn sendir heartbeat hvenær megi uppfæra leikinn.  Þetta myndi tryggja að allir sæju sama ástand á heimnum.  

    * Ókosturinn þá væri mikið latency.  Slæmt í fast-paced leikjum.

  * Eða það er hægt að framkvæma skipunina og bakka til baka ef þjóninn segir til um það.

    * Hinsvegar væri maður ekki búinn að fá uppfærslu hvað annar leikmaður væri að gera, hvort hann haldi áfram að gera það sem hann var að gera eða stöðvi.  Þá þarf að notast við interpolation/extrapolation.

* Tölva A er hraðvirkari en tölva B, þannig tölva A update-ast oftar en B.  T.d. A sér leikmaður á tölvu B hefur orðið fyrir skoti en B sér sig hafa sloppið frá skotinu.  Þá er kominn conflict sem þarf að díla við

  * Lendir í vandamálum með numerical integration ef mismunandi vélar update-ast á mismunandi tímum.
 
 **Daníel:** Sammála. Nema við náum að gera leikinn alveg epic viku fyrir skil, að þá skal multiplayer mæti algjörum afgangi.

