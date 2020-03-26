import React from 'react';

export interface TagProps {
    card: string;
}

const Tag = ({ card }: TagProps): JSX.Element => (
    <span className={`tag ${card}`}>{card}</span>
);

export default Tag;
