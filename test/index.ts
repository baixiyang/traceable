import {Traceable} from "../src";

let traceable = new Traceable<any>({a: [1,2,3,4,5]})
let wait = () => Promise.resolve();


(async ()=> {
    traceable.data.a.push(11,22,33,44)
    console.log(traceable.data)
    traceable.backward()
    console.log(traceable.data)
    console.log(traceable.data.__v_isReadonly)
})()

