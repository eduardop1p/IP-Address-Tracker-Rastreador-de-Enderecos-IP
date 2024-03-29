import 'core-js/stable'
import 'regenerator-runtime'

import leaflet from 'leaflet'
import axios from 'axios'

class IpAddressTracker{
    constructor(){
        this.ipElment = document.querySelector('#ip')
        this.mapElment = document.querySelector('.map')
        this.mapControler = null
        this.ipUserNum = null
        this.geolocationObject = {}
    }
    init(){
        this.enterFormIpInit()
        this.ipUser()
    }
    err(msg){
        setTimeout(()=> alert(msg), 50)
    }
    enterFormIpInit(){
        const containerSearchIp = document.querySelector('.container-search-ip')
        containerSearchIp.onsubmit = (event) => {
            event.preventDefault();
            this.geolocationApi(this.ipElment.value)
        }
    }
    async ipUser(){
        this.loaderActived()
        const url = 'https://api.ipify.org/?format=json'
        try{
            const { data } = await axios.get(url)

            this.ipUserNum = data.ip
            this.inputIp()
        }catch(err){ 
            this.limpaLoader()
            this.err('Error no sistema, recarregue a página.') 
        }
    }
    inputIp(){
        const searchIp = document.querySelector('.search')
        this.ipElment.value = this.ipUserNum
        this.geolocationApi(this.ipUserNum)
        searchIp.addEventListener('click', ()=> this.geolocationApi(this.ipElment.value))
    }
    async geolocationApi(ipUserNum){
        if(!this.ipElment.value) {
            this.err('Campo IP não pode está vazio.')
            return
        } 
        this.loaderActived()
        const url = `https://geo.ipify.org/api/v2/country,city?apiKey=${process.env.API_KEY_GEOLOCATION}&ipAddress=${ipUserNum}`
        try{
            const { data } = await axios.get(url)
            this.geolocationObject = {
                ip: data.ip,
                location: { 
                    country: data.location.country,
                    region: data.location.region,
                    timezone: data.location.timezone,
                    city: data.location.city,
                    postalCode: data.location.postalCode,
                    lat: data.location.lat,
                    lng: data.location.lng
                },
                isp: data.isp
            }
            if(this.mapControler) this.mapControler.remove()
            this.leafletMaps()
            this.searchIpAction()
            this.limpaLoader()
        }catch(err){ 
            this.limpaLoader()
            this.err('Endereço IP inválido.') 
        }
       
    }
    limpaLoader(){
        return document.querySelectorAll('.loader').forEach(loader => loader.remove())
    }
    loaderActived(){
        const loader = document.createElement('div')
        loader.classList.add('loader')
        loader.innerHTML = `
            <?xml version="1.0" encoding="utf-8"?>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: rgba(255, 255, 255, 0); display: block; shape-rendering: auto;" width="150px" height="150px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
            <path fill="none" stroke="#111111" stroke-width="8" stroke-dasharray="42.76482137044271 42.76482137044271" d="M24.3 30C11.4 30 5 43.3 5 50s6.4 20 19.3 20c19.3 0 32.1-40 51.4-40 C88.6 30 95 43.3 95 50s-6.4 20-19.3 20C56.4 70 43.6 30 24.3 30z" stroke-linecap="round" style="transform:scale(0.8);transform-origin:50px 50px">
            <animate attributeName="stroke-dashoffset" repeatCount="indefinite" dur="0.819672131147541s" keyTimes="0;1" values="0;256.58892822265625"></animate>
            </path>
            <!-- [ldio] generated by https://loading.io/ --></svg>
        `
        return document.body.appendChild(loader)
    }
    searchIpAction(){
        const contentIpAddress = document.querySelector('.content-ip-address')
        const contentLocation = document.querySelector('.content-location')
        const contentTimezone = document.querySelector('.content-timezone')
        const contentIsp = document.querySelector('.content-isp')

        contentIpAddress.innerHTML = this.geolocationObject.ip
        contentLocation.innerHTML = `
            ${this.geolocationObject.location.country}, ${this.geolocationObject.location.region}, ${!this.geolocationObject.location.postalCode ? this.geolocationObject.location.city : this.geolocationObject.location.city+', '+this.geolocationObject.location.postalCode}
        `
        contentTimezone.innerHTML = this.geolocationObject.location.timezone
        contentIsp.innerHTML = this.geolocationObject.isp
    }
    leafletMaps(){
        const map = leaflet.map(this.mapElment).setView([this.geolocationObject.location.lat, this.geolocationObject.location.lng], 14)
        leaflet.tileLayer(`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${process.env.TOCKEN_ACESS_MAP}`, {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 20,
            minZoom: 3,
            id: 'mapbox/streets-v11',
            tileSize: 512,
            zoomOffset: -1,
        }).addTo(map)
        leaflet.marker([this.geolocationObject.location.lat, this.geolocationObject.location.lng]).addTo(map);
        leaflet.popup()
            .setLatLng([this.geolocationObject.location.lat, this.geolocationObject.location.lng])
            .setContent("Seu provedor de internet está aqui (ISP).")
            .openOn(map);
        this.mapControler = map
    }   
}

const ipAddress = new IpAddressTracker()
ipAddress.init()