# Hopverkefni
Lokaverkefni TOL308G

## Basic
Sjá stöðuna á verkefni => ´git status´
Sjá branches og í hverju þú ert í => ´git branch -a´


## Skrá username og password (svo þið þurfið ekki að gera það fyrir hvert push)
git config --global user.name "notandanafn"
git config --global user.email "email@email.com"
(það er líka hægt að láta git muna psswordið þitt)

## Byrja að nota Git og sækja verkefnið
1. Gera nýja möppu
2. git remote
3. git clone https://github.com/dingolfsson/Hopverkefni.git
cd Hopverkefni

Núna ætti ´git remote´ að sýna "origin" á skjánum.

´git fetch origin master´ sækir öll ný skjöl sem er búið að bæta við projectið en merge-ar ekki.
´git pull origin master´ sækir öll ný skjöl og uppfærir þau sem þú ert með.

## Dæmi með git branch
### Gera nýtt branch
git branch Notandi 
### Fara á nýja branchið
git checkout Notandi
### Gera prufu skrá og commit-a
touch test.txt
git add -A
git commit -m "Prufuskrá bætt við"

Núna er búið að bæta við og commit-a test.txt á local branchinu, ekki master.

### Bæta við test.txt í resp.
git push -u origin nafn-a-branchi
git checkout master
git pull origin master
git merge nafn-a-branchi
git push origin master

### Eyða branch ef það verður ekki notað aftur
git branch -d nafn-a-branchi
git push origin --delete nafn-a-branchi
