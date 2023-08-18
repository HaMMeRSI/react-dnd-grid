import { CSSProperties, useEffect, useState } from 'react';
import { Metadata } from '../../types';
import { breakTokenId } from '../../Utils';
import './DescriptionBox.css';

type Props = {
    tokenId: number;
    scale: number;
};

const getBoxStyle = (tokenId: number, scale: number): CSSProperties => {
    const section = breakTokenId(tokenId);
    const adjScale = Math.min(2, Math.max(0.2, 1 / scale));

    return {
        position: 'absolute',
        top: `${section.y + section.h / 5}px`,
        left: `${section.x + section.w + 15 * adjScale}px`,
        transform: `scale(${adjScale}`,
        transformOrigin: '0 0',
        cursor: 'default',
        maxWidth: '50ch',
        fontSize: '2rem',
    };
};

export default function DescriptionBox({ tokenId, scale }: Props) {
    const [metaData] = useState<Metadata | null>(null);
    const [owner] = useState('');

    useEffect(() => {}, [tokenId]);

    return (
        <div className="db_container" style={getBoxStyle(tokenId, scale)}>
            <div className="db_content">
                <div className="db_header">
                    <div className="db_header_owner">
                        <span>@</span>
                        <a target="_blank" rel="noreferrer" href={metaData?.bio_link} className="db_header_owner_name">
                            {metaData?.name}
                        </a>
                        <span> owns: #</span>
                        <a target="_blank" rel="noreferrer">
                            {tokenId}
                        </a>
                    </div>
                    <div className="db_header_address">
                        <a target="_blank" rel="noreferrer" href={`https://etherscan.io/address/${owner}`}>
                            {owner}
                        </a>
                    </div>
                </div>
                <div className="db_description">{metaData?.description}</div>
                <div className="db_link">
                    <a target="_blank" rel="noreferrer" href={metaData?.external_url}>
                        {metaData?.url_title}
                    </a>
                </div>
            </div>
        </div>
    );
}
