import React from 'react';

export interface TagProps {
    card: string;
    text?: string;
}

const Tag = ({ card, text = card }: TagProps): JSX.Element => (
    <span className={`tag ${card}`}>{text}</span>
);

export default Tag;
