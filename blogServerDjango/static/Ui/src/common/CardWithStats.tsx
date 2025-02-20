import { Card, Divider, Flex, Progress } from "antd";


function CardWithStats(props: any) {
    var data = props.data
    var max = props.max

    var keysSorted = Object.keys(data).sort(function (a, b) { return data[b] - data[a] })
    keysSorted = keysSorted.slice(0, max)
    var total = 0
    for (var key of keysSorted) {
        total += data[key]
    }
    const getRandomColor = (item: string = '') => {
        if (item === 'easy') {
            return 'green'
        } if (item === 'medium') {
            return '#EED202'
        } if (item === 'hard') {
            return 'red'
        }
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
    return (
        <Card style={{ marginLeft: '10px', width: '100%', marginBottom: '10px' }}>
            <span ><b>{props.title}</b></span>
            <Divider />
            <Flex vertical style={{ width: "100%" }}>
                {
                    keysSorted.map((item) => {
                        const randomColor = getRandomColor(item);
                        return (
                            <div style={{ display: 'flex', paddingTop: '5px' }}>
                                <span style={{ width: '65%', textAlign: 'left' , textDecoration :'bold' }}>{`${item.length && item.split('-')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join('-')} - ${data[item]}`}</span>
                                <span style={{ width: '35%' }}><Progress percent={parseFloat(((data[item] / total) * 100).toFixed(2))} strokeColor={randomColor} size="small" /></span>
                            </div>
                        )
                    })
                }

            </Flex>
        </Card>
    )

}

export default CardWithStats