function main() {

    const canvases = document.getElementById('canvases');

    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 500;
    const screenManager = new UIFrame(canvas);

    canvas.addEventListener('mousemove', evt => {
        
        const rect = canvas.getBoundingClientRect();
        const x = evt.clientX - rect.left;
        const y = evt.clientY - rect.top;
    });

    canvas.addEventListener('mousedown', evt => {
        
        const rect = canvas.getBoundingClientRect();
        const x = evt.clientX - rect.left;
        const y = evt.clientY - rect.top;

        screenManager.press(x, y);
    });

    const ctx = canvas.getContext('2d');

    canvases.appendChild(canvas);

    const startScreen = new UIContainer();


    const list1 = new UIList();

    const button1 = new UIButton('Select Map');
    const button2 = new UIButton('About');
    const button3 = new UIButton('Exit');

    list1.addChild(button1);
    list1.addChild(button2);
    list1.addChild(button3);

    startScreen.addChild(list1);

    const mapSelectionScreen = new UIContainer();

    const list2 = new UIList();

    const button4 = new UIButton('Map #1');
    const button5 = new UIButton('Map #2');
    const button6 = new UIButton('Map #3');
    const button7 = new UIButton('Back');

    list2.addChild(button4);
    list2.addChild(button5);
    list2.addChild(button6);
    list2.addChild(button7);

    mapSelectionScreen.addChild(list2);
    
    screenManager.setLayout('card');
    screenManager.addChild(startScreen, 0);
    screenManager.addChild(mapSelectionScreen, 1);
    
    screenManager.setBackgroundColor('#f0f0f0');
    screenManager.selectCard(0);

    // Event handling

    button1.addEventListener('press', evt => {
        screenManager.selectCard(1);
        screenManager.render(ctx);
    });

    button7.addEventListener('press', evt => {
        screenManager.selectCard(0);
        screenManager.render(ctx);
    });

    // DEBUG
    screenManager.setName('screen manager');
    startScreen.setName('start screen');
    list1.setName('list 1');
    button1.setName('button 1');
    button2.setName('button 2');
    button3.setName('button 3');
    mapSelectionScreen.setName('map selection screen');
    list2.setName('list 2');
    button4.setName('button 4');
    button5.setName('button 5');
    button6.setName('button 6');
    button7.setName('button 7');

    screenManager.render(ctx);
}

main();



