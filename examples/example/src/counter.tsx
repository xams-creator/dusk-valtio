import { useDuskValtioSnapshot } from "@xams-framework/dusk-valtio";
import { store } from "@/store.ts";

export function Counter() {
    const snapshot = useDuskValtioSnapshot(store);
    console.log(1);
    return (
        <>
            <button onClick={store.add}>+</button>
            {snapshot.count} {snapshot.double}

            <ul>
                {snapshot.obj.list.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </>
    );
}
