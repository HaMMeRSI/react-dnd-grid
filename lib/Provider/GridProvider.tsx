import { Rect } from '@/types';
import { ReactNode, createContext, useContext, useState } from 'react';

interface IDndApi {
    mask: Rect | null;
    setMask: (mask: Rect | null) => void;
}

const Store = createContext<IDndApi>({
    mask: null,
    setMask: () => {},
});

export const useGridContext = () => useContext(Store);

interface IProps {
    children: ReactNode;
}

export default function ({ children }: IProps) {
    const [mask, setMask] = useState<Rect | null>(null);

    return <Store.Provider value={{ mask, setMask }}>{children}</Store.Provider>;
}
