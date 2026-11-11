import {api} from '../api.js';
import {cards,status} from '../utils.js';
const target=document.getElementById('places');
try { const c=await api.catalog(); cards(target,c.attractions,'place'); }
catch(e) { status(target,e.message,true); }
