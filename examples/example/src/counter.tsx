import { useSnapshot } from "@xams-framework/dusk-valtio";
import { store } from "@/store.ts";


export function Counter() {
    const snapshot = useSnapshot(store.$state);
    console.log(1);
    return (
        <>
            <button onClick={store.asyncAdd}>+</button>
            {snapshot.count} {snapshot.double}

            {/*<ul>*/}
            {/*    {snapshot.obj.list.map((item, index) => (*/}
            {/*        <li key={index}>{item}</li>*/}
            {/*    ))}*/}
            {/*</ul>*/}
        </>
    );
}
