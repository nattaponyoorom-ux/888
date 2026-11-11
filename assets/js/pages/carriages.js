import {api} from '../api.js';
import {cards,status} from '../utils.js';
const target=document.getElementById('catalog');
try { const c=await api.catalog(); cards(target,c.carriages,'carriage'); }
catch(e) { status(target,e.message,true); }
