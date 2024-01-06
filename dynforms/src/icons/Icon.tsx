import './icons.css';

function Icon(props) {
    const name = props.name

    if (!name) {
        return;
    }

    const classNames = `icon icon-${name}`;
    return (
        <div className={classNames}></div>
    )
}

export default Icon