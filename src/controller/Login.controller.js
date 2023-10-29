const request = require('request');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const getCookie = (username, password) => {
    return new Promise((resolve, reject) => {
        let options = {
            'method': 'POST',
            'url': 'https://vzportal.merlot.aero/common/Account/LogOn?app=Crew&ReturnUrl=%2fCrew/',

            formData: {
                // '__RequestVerificationToken': 'ZWnigYD_6dJNF5Hw77vzYpdEI_pMxYuOCYyWqrABtKLtoGRr5AHr8iCY8aZUEPa0jMHyeO7CVXHtp8QhzBjhuYEeAh41',
                'UserName': username,
                'Password': password,
                'ddlLanguage': 'en'
            }
        };
        request(options, (error, response, body) => {
            if (error)
                console.error('error getCookie:', error);
            if (response.statusCode != 302) {
                return reject(400)
            }
            let cookies = response.headers['set-cookie']
            let Cookie = cookies[1].split(";")[0]
            // for (let index in cookies) {
            //     Cookie += cookies[index].split(";")[0]
            //     if (index < cookies.length - 1)
            //         Cookie += "; "
            // }
            return resolve(Cookie)
        })
    })
}
const checkCookieAvalible = (cookie) => {
    return new Promise((resolve, reject) => {
        let options = {
            'method': 'GET',
            'url': 'https://vzportal.merlot.aero/Crew/Home/ReportForm/1?X-Requested-With=XMLHttpRequest',
            'headers': {
                'Cookie': cookie
            }
        };
        request(options, (error, response, body) => {
            if (response.statusCode == 200) {
                return resolve(true)
            }
            else {
                return resolve(false)
            }
        })
    });
};

const login = (username, password) => {
    return new Promise((resolve, reject) => {
        let options = {
            'method': 'POST',
            'url': 'https://vzportal.merlot.aero/common/Account/LogOn?app=Crew&ReturnUrl=%2fCrew/',

            formData: {
                // '__RequestVerificationToken': 'ZWnigYD_6dJNF5Hw77vzYpdEI_pMxYuOCYyWqrABtKLtoGRr5AHr8iCY8aZUEPa0jMHyeO7CVXHtp8QhzBjhuYEeAh41',
                'UserName': username,
                'Password': password,
                'ddlLanguage': 'en'
            }
        };

        request(options, (error, response, body) => {
            if (error)
                console.error('error login:', error);
            // console.log('statusCode:', response && response.statusCode);
            // console.log(body)

            let start = body.indexOf("param=") + 6;
            let end = body.indexOf("\>here<");
            let param = body.slice(start, end)

            let cookies = response.headers['set-cookie']
            let Cookie = ""
            for (let index in cookies) {
                Cookie += cookies[index].split(";")[0]
                if (index < cookies.length - 1)
                    Cookie += "; "
            }

            let result = {
                "param": param,
                "cookie": Cookie
            }
            return resolve(result)
        })
    })
}

const getAccountInfo = (cookie) => {
    return new Promise((resolve, reject) => {
        let options = {
            'method': 'GET',
            'url': 'https://vzportal.merlot.aero/Crew/Employee/Edit',
            'headers': {
                'Cookie': cookie
            }
        };
        request(options, (error, response, body) => {
            if (error)
                console.error('error getAccountInfo:', error);

            try {
                const { document } = (new JSDOM(body)).window;
                let name = document.getElementById("ProfileTab_KnownAs").value
                let username = document.getElementById("ProfileTab_Username").value

                return resolve({
                    name: name,
                    username: username
                })
            }
            catch(e){
                return reject(e)
            }

        })
    });
}


module.exports = { getCookie, checkCookieAvalible, getAccountInfo }