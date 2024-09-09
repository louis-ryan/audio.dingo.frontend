const Links = ({ videos }) => {

    const formatName = (filename) => {
        const parts = filename.split('_');
        if (parts.length > 3) {
            return parts.slice(3).join('_');
        }
        return '';
    };

    const formatUrl = (filename) => {
        const formattedUrl = 'http://localhost:5000/download/' + filename
        return formattedUrl
    }

    return (
        <div>
            <h1>Links for Download</h1>
            <div className="scrollablelinks">
                {videos.map((video, idx) => {
                    console.log("formatted name: ", formatName(video.filename))
                    return (
                        <a
                            key={idx}
                            href={formatUrl(video.filename)}
                            download
                        >
                            <div className="linkbox">
                                <h3>{formatName(video.filename)}</h3>
                                <p>x days remaining</p>
                            </div>
                        </a>
                    )
                })}
            </div>
        </div>
    )
}

export default Links;