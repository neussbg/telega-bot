
const TelegramApi = require('node-telegram-bot-api')

const token = '6195145742:AAGGoBeUgpL2fduG80SOIJeLgik7j1p0d3w';

const agrement = 0.43;

const bot = new TelegramApi(token, {polling: true});

const currentProfile = '@TakePoizonM'

let currentAmount = 0;

let currentValue = 0

let isWaitForMessage = false;

let priceDict = {}

async function setCurs(amount){
    const TRIVIA_URL = `https://api.api-ninjas.com/v1/convertcurrency?have=CNY&want=RUB&amount=${amount}`
    const moneyApiKey = 'mTwFDgRcNAI1/viXi0ux2w==uIrx0nBLjvxZ39ZX'
  return  fetch(TRIVIA_URL, {
      method: 'GET',
      headers: {
          'X-API-KEY': moneyApiKey,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      },
    })
    .then(response => response.json()).then((resp)=> (Number(resp.new_amount + agrement).toFixed(2)))
    .catch(error => console.error(error)); 
}

async function setMenuBtns(bot, chatId, msg){
    return await  bot.sendMessage(chatId, `${msg}`, {
                    reply_markup:{
                        keyboard:[
                            [ {text:'💴 Рассчитать стоимость'}],
                            [
                                {
                                    text: '🎯Отзывы'
                                },
                                {
                                    text: '❗️Акции❗️'
                                },
                            ],
                            [
                                {
                                    text: '🚚Как заказать?'
                                },
                                {
                                    text: '❔Ответы на вопросы'
                                },
                            ],
                            [
                                {
                                    text: '📲Связь с менеджером и актуальный курс'
                                },
                                {
                                    text: '🔡Аббревиатуры на товарах'
                                },
                            
                            ],
                        ],
                        resize_keyboard: true,
                    },
                })
};


async function setMenuClothesBtns(chatId, bot, msg){
    for(let i = 1; i <= 4; i++){
        priceDict[i] = false
    }
    return await  bot.sendMessage(chatId, `${msg}`, {
                    reply_markup:{
                        keyboard:[
                            [
                                {
                                    text: '👟Обувь/Верхняя одежда'
                                },
                                {
                                    text: '👖Толстовки/Штаны'
                                },
                            ],
                            [
                                {
                                    text: '👕Футболка/Шорты'
                                },
                                {
                                    text: '🧦Носки/Нижнее белье'
                                },
                            ],
                            [
                                {
                                    text: '♻️Меню'
                                },
                            ],
                        ],
                        resize_keyboard: true,
                    },
                })
};

 function setCurrenClothesBth(chatId, bot, msg){
    for(let i = 1; i <= 4; i++){
        priceDict[i] = false
    }
    return  bot.sendMessage(chatId, `${msg}`, {
        reply_markup:{
            inline_keyboard: [
        [
                {
                text: '📲Менеджер',
                url: 'https://t.me/TakePoizonM'
            },
        ],
        [
            {
                text: '♻️Меню',
                callback_data: 'menus'
            },

            {
                text: '💴 Рассчитать стоимость',
                callback_data: 'prices'
            }, 
        ]
        ],
            resize_keyboard: true,
        },
                })
};

async function getBackupMenu(chatId, bot, msg){
    return await bot.sendMessage(chatId, `${msg}`, {
                        reply_markup:{
                            keyboard:[
                                ['♻️Меню']],
                            resize_keyboard: true,
                            
                        },
                        parse_mode: 'HTML'
                    })
};

async function callbackQuery(chatId, bot, msg){
    bot.on('callback_query',  async (query) => {
        await bot.answerCallbackQuery(query.id)
        if(query.data === 'menus' ){
          return  setMenuBtns(bot, chatId, setMenuMessage(msg))
        }

        if(query.data === 'prices'){
           await bot.sendMediaGroup(chatId,[ {type: 'photo', media: 'imgs/photo1.jpg'}, {type: 'photo', media: 'imgs/photo2.jpg'}]);
            return setMenuClothesBtns(chatId, bot, 'Выберите категорию товара')
        }
        return
    });
}

function setActualCursForClother(dictEl, textValue, chatId, bot){
    return setCurs(1).then((response)=>{
        currentAmount = +response
        return getBackupMenu(chatId, bot, `Введи цену на ${textValue} в Юань,
а я рассчитаю конечную стоимость
Курс ¥ - ${response}` ).then(()=>{
    priceDict[dictEl] = true
    setTimeout(() => {
        isWaitForMessage = true
    }, 500);
})
    })
}

function setDefaultMessage(msg){
return `Привет ${msg.from.first_name}!
    
Тут ты можешь рассчитать сумму своего
заказа 💴 
            
Связаться с менеджером для оформления заказа ;)
${currentProfile}
Получить ответы на все свои вопросы 🤔`
}

function setMenuMessage(msg){
return `${msg.from.first_name} , Тут вы можете выбрать другой раздел меню`
}

function setPriceText(curs){
return `
Стоимость включает: 
   
Доставка 🚚 по Китаю 
Доставка Китай-Ростов-на-Дону
Комиссия нашего сервиса 
Курс ¥ - ${curs}₽ (КУРС АКТУАЛЕН НА МОМЕНТ ОТПРАВЛЕНИЯ ВАМИ ЗАПРОСА, ЧЕРЕЗ ДЕНЬ ОН МОЖЕТ ИЗМЕНИТЬСЯ)
   
Стоимость рассчитана до склада в Ростове-на-Дону
Если вы покупаете более 2-х товаров за один раз, то стоимость каждого следующего товара будет идти со скидкой 
   
👟 Обувь: -500₽
👖Толстовка/штаны: -350₽
👕/🩳Футболка/шорты: -250₽
🧦Носки/нижнее белье: -150₽
   
‼️При оформлении 10-ти позиций скидка индивидуальна‼️
Уточняйте тут: ${currentProfile} `  
}

async function calculatePrice(chatId, bot, value){
    let firsProd = 0;
    let secondProd = 0;
    let result = Object.values(priceDict)?.findIndex((el)=> el === true);

        switch(result){
            case 0:
                firsProd = 1950;
                secondProd = 1460;
                break;
                case 1:
                    firsProd = 1800;
                    secondProd = 1030;
                    break;
                    case 2:
                        firsProd = 1400;
                        secondProd = 600;
                        break;
                case 3:
                    firsProd = 1250;
                    secondProd = 450;
                    break;
                }
                currentValue = (currentAmount * value + firsProd + secondProd);
    const procent =  (currentValue / 100) * 2;
    return setCurrenClothesBth(chatId, bot, `Итоговая стоимость позиции: ${Math.floor(currentValue + procent)}
    ${setPriceText(currentAmount)}`)
}


async function startBot(){

    bot.on('message',  async (msg)=>{
        const text = msg.text;
        const chatId = msg.chat.id;
        
        if(text === '/start'){
            await bot.sendAnimation(chatId, 'imgs/hello.gif')
            return  setMenuBtns(bot, chatId, setDefaultMessage(msg))
        }
    
        if(msg.text.includes('Как заказать')){
            return getBackupMenu(chatId, bot, `Перед оформлением заказа прочтите данную статью: https://teletype.in/@takepoizon/howtobuy`)
        }

        if(msg.text.includes('Ответы')){
            return getBackupMenu(chatId, bot, `
<a href='https://teletype.in/@takepoizon/loadandreg'>- Как скачать и зарегистрироваться на Poizon-Dewu?</a>

<a href='https://teletype.in/@takepoizon/howtobuy'>- Как рассчитать итоговую стоимость позиций а также оформить заказ?</a>

<a href='https://teletype.in/@takepoizon/meanofbutton'>- Какое значение имеют кнопки на карточке товара?</a>

<a href='https://teletype.in/@takepoizon/questionsdelivery'>- Все о доставке.</a>`)
        }
        if(msg.text.includes('Рассчитать стоимость')){
            await bot.sendMediaGroup(chatId,[ {type: 'photo', media: 'imgs/photo1.jpg'}, {type: 'photo', media: 'imgs/photo2.jpg'}]);
            return setMenuClothesBtns(chatId, bot, 'Выберите категорию товара')
        }
        if(msg.text.includes('Связь')){

            await setCurs(1).then((response)=>{
                currentAmount = +response
                        })
                        
            return getBackupMenu(chatId, bot, `Актуальный курс на данный момент: ${currentAmount} ¥ (КУРС АКТУАЛЕН НА
МОМЕНТ ОТПРАВЛЕНИЯ ВАМИ ЗАПРОСА, ЧЕРЕЗ ДЕНЬ ОН
МОЖЕТ ИЗМЕНИТЬСЯ)
Менеджер: ${currentProfile}`)
        }
        if(msg.text.includes('Отзывы')){
            return getBackupMenu(chatId, bot, `Отзывы: @tpotzivi`)
        }
        if(msg.text.includes('Акции')){
            return getBackupMenu(chatId, bot, `💵 При оформлении второй позиции имеются скидки:

👟 Обувь: 500₽
👖Толстовка/штаны: 350₽
👕/🩳Футболка/шорты: 250₽
🧦Носки/нижнее белье: 150₽
            
При оформлении 10-ти позиций скидка индивидуальна‼️
Уточняйте тут: ${currentProfile}`)
        }

        if(msg.text.includes('Аббревиатуры')){
            await bot.sendPhoto(chatId, 'imgs/abbr.jpg')
            return getBackupMenu(chatId, bot, `В отличие от многих других сервисов по доставке вещей с
Poizon, мы предоставляем открытую информацию по
аббревиатурам, из-за которых цена на одну и туже модель может быть разной. Каждая аббревиатура рассчитана на
определенный регион.☺️`)
        }

        if(msg.text.includes('Обувь')){
            return setActualCursForClother(1,'👟Обувь/Верхняя одежда', chatId, bot );
        }

        if(msg.text.includes('Толстовки')){
            return setActualCursForClother(2,'👖Толстовки/Штаны', chatId, bot );
        }

        if(msg.text.includes('Футболка')){
            return setActualCursForClother(3,'👕Футболка/Шорты', chatId, bot );
        }

        if(msg.text.includes('Носки')){
            return setActualCursForClother(4,'🧦Носки/Нижнее белье', chatId, bot );
        }

        if(msg.text?.includes('♻️Меню')){
            return setMenuBtns(bot, chatId, setMenuMessage(msg))
        }

            const isNotNumber = isNaN(Number(msg.text))

            if(isWaitForMessage && !isNotNumber){
                await calculatePrice(chatId, bot, Number(msg.text))
                isWaitForMessage = false
            }
            if(isWaitForMessage && isNotNumber){
                return bot.sendMessage(chatId, `❌Вводите только цифры` )
            }
               
             callbackQuery(chatId, bot, msg)

    })
}



startBot()





