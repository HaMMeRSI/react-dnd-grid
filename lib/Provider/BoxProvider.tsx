import { Rect } from '$/types';
import { ReactNode, createContext, useContext, useState } from 'react';

interface IBoxApi {
    selection: Rect | null;
    setSelection: (mask: Rect | null) => void;
}

const Store = createContext<IBoxApi>({
    selection: null,
    setSelection: () => {},
});

export const useBoxContext = () => useContext(Store);

interface IProps {
    children: ReactNode;
}

export default function ({ children }: IProps) {
    const [selection, setSelection] = useState<Rect | null>(null);

    return <Store.Provider value={{ selection, setSelection }}>{children}</Store.Provider>;
}
