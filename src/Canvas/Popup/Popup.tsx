import { CSSProperties, MouseEvent as SyntheticMouseEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { breakTokenId, stopPropagation, getImageSize } from '../../Utils';
import './Popup.css';

type Props = {
    tokenId: number;
    onClose: (e?: SyntheticMouseEvent) => void;
    parentForPotal: React.RefObject<HTMLDivElement>;
    isVisible: boolean;
};

const errStyle: CSSProperties = {
    textAlign: 'center',
    fontSize: '1.4rem',
};

function checkLength(length: number) {
    return async (str: string) => {
        return str.length <= length || 'Length exceeds ' + length;
    };
}

async function exists(value: any) {
    return !!value || 'does not exists';
}

async function checkImage(imageURL: string) {
    const imageSize = await getImageSize(imageURL);
    return imageSize <= 1_000_000 || 'Max image size: 1MB';
}

export default function Popup({ tokenId, onClose, parentForPotal, isVisible }: Props) {
    const [name, setName] = useState('');
    const [bioLink, setBioLink] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [description, setDescription] = useState('');
    const [urlTitle, setUrlTitle] = useState('');
    const [externalUrl, setExternalUrl] = useState('');
    const [currency, setCurrency] = useState('ETH');
    const [validityResult, setValidityResult] = useState<boolean | string>(false);
    const [isOccupied] = useState(true);

    async function checkValidity() {
        const checkList: any[] = [
            [exists, { tokenId, name, imageURL, bioLink, description, urlTitle, externalUrl }],
            [checkLength(255), { description, bioLink, imageURL, externalUrl }],
            [checkLength(40), { name, urlTitle }],
            [checkImage, { imageURL }],
        ];

        for (const checks of checkList) {
            const keys = Object.keys(checks[1]);
            for (const key of keys) {
                const result = await checks[0](checks[1][key]);
                if (result !== true) {
                    return `${key} ${result}`;
                }
            }
        }

        return true;
    }

    const mask = breakTokenId(tokenId);
    const area = (mask.w + 1) * (mask.h + 1);

    useEffect(() => {
        checkValidity().then(result => {
            setValidityResult(result);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenId, name, bioLink, imageURL, description, urlTitle, externalUrl, currency]);

    const getFormBody = () => {
        if (isOccupied) {
            return <div style={errStyle}>Area is occupied!</div>;
        } else {
            return (
                <>
                    <div className="row">
                        <span>
                            <input
                                className="gate"
                                id="dpname"
                                type="text"
                                maxLength={40}
                                placeholder="Max 40 characters"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                            <label htmlFor="dpname">Display name</label>
                        </span>
                    </div>
                    <div className="row">
                        <span>
                            <input
                                className="gate"
                                id="imageURL"
                                type="text"
                                maxLength={255}
                                placeholder="Max 255 characters and 1MB"
                                value={imageURL}
                                onChange={e => setImageURL(e.target.value)}
                            />
                            <label htmlFor="imageURL">Image URL</label>
                        </span>
                    </div>
                    <div className="row">
                        <span>
                            <input
                                className="gate"
                                id="biolink"
                                type="text"
                                maxLength={255}
                                placeholder="Max 255 characters"
                                value={bioLink}
                                onChange={e => setBioLink(e.target.value)}
                            />
                            <label htmlFor="biolink">Bio link</label>
                        </span>
                    </div>
                    <div className="row">
                        <span>
                            <input
                                className="gate"
                                id="descr"
                                type="text"
                                maxLength={255}
                                placeholder="Max 255 characters"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                            <label htmlFor="descr">Description</label>
                        </span>
                    </div>
                    <div className="row">
                        <span>
                            <input
                                className="gate"
                                id="urlTitle"
                                type="text"
                                maxLength={40}
                                placeholder="Max 40 characters"
                                value={urlTitle}
                                onChange={e => setUrlTitle(e.target.value)}
                            />
                            <label htmlFor="urlTitle">URL title</label>
                        </span>
                    </div>
                    <div className="row">
                        <span>
                            <input
                                className="gate"
                                id="urlpop"
                                type="text"
                                maxLength={255}
                                placeholder="Max 255 characters"
                                value={externalUrl}
                                onChange={e => setExternalUrl(e.target.value)}
                            />
                            <label htmlFor="urlpop">URL</label>
                        </span>
                    </div>
                    <div className="modal__footer">
                        <select
                            className="modal__currency"
                            value={currency}
                            onChange={e => {
                                setCurrency(e.target.value);
                            }}>
                            {Object.keys({ a: 'b' }).map(ticker => (
                                <option key={ticker} value={ticker}>
                                    234
                                </option>
                            ))}
                        </select>
                        <button
                            className="modal__btn"
                            style={{ display: currency === 'ETH' ? 'none' : 'block' }}
                            onClick={_e => onApproveClick()}>
                            Approve &rarr;
                        </button>
                        <button
                            className="modal__btn"
                            style={{ margin: '0 0 0 auto' }}
                            disabled={validityResult !== true}
                            onClick={_e => onMintClick()}>
                            Mint &rarr;
                        </button>
                    </div>
                    <div className="modal__error">{validityResult === true ? '' : validityResult}</div>
                </>
            );
        }
    };

    const onApproveClick = async () => {};

    const onMintClick = async () => {
        if (validityResult !== true) {
            return;
        }

        setValidityResult('Please approve before minting');
    };

    return createPortal(
        <div
            className="modal-container"
            style={{ display: isVisible ? 'flex' : 'none' }}
            onMouseDown={stopPropagation}
            onMouseUp={stopPropagation}>
            <div className="modal">
                <div className="modal__details">
                    <h1 className="modal__title">Minting token: {tokenId}</h1>
                    <p className="modal__description">{`(X: ${mask.x} Y:${mask.y}) - Width: ${mask.w + 1} Height: ${
                        mask.h + 1
                    }, Area: ${area}`}</p>
                </div>

                {getFormBody()}

                <span className="link-2" onMouseUp={onClose}></span>
            </div>
        </div>,
        parentForPotal.current as HTMLDivElement
    );
}
