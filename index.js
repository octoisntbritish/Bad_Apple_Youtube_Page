// Libraries
const jimp = require("jimp");
const ffmpeg = require("ffmpeg");
const fs = require("fs");
const Jimp = require("jimp");
const lodash = require("lodash");
const cliProgress = require('cli-progress');

// Frame Intervals
const EVERY_N_FRAME_SET = 1;
const vid_x = 4;
const vid_y = 3;

const THUMBNAIL_WIDTH = 281;
const THUMBNAIL_HEIGHT = 158;

const CHANNEL_WIDTH = 36;
const CHANNEL_HEIGHT = 36;

const HORIZONTAL_MARGIN = 16;
const VERTICAL_MARGIN = 86;
const VERTICAL_MINOR = 12;

console.log("Extracting frames... (This should only take a minute or two.)")

// Extract Video To JPG frames (Stole from Stack Overflow :D)
try {
    let process = new ffmpeg("video_input/input.mp4");
    process.then( (video) =>
    {
        video.fnExtractFrameToJPG("./frame_output/whole_frames", 
        {
            every_n_frames : EVERY_N_FRAME_SET
        }, resized_frames)
    }, function (err) 
    {
        console.log('Error: ' + err);
    });
} 
catch (e) 
{
    console.log(e.code);
    console.log(e.msg);
}

async function resized_frames(error, files)
{
    console.log("Resizing frames... (This may take a very, very long time.)")

    // Create a progress bar
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(6955, 0);

    // Get Number of Frames
    let total_frames = files.length;

    // Resize Frames
    const PIXEL_WIDTH = (HORIZONTAL_MARGIN * (vid_x - 1)) + (THUMBNAIL_WIDTH * vid_x);
    const PIXEL_HEIGHT = (VERTICAL_MARGIN * (vid_y - 1)) + ((THUMBNAIL_HEIGHT + VERTICAL_MARGIN) * vid_y);

    for(let i = 1; !(i > total_frames); ++i)
    {
        const in_path = "./frame_output/whole_frames/input_" + i + ".jpg";
        const out_path = "./frame_output/resized_frames/frame_" + i + ".jpg";
        const img = await Jimp.read(in_path);

        img.resize(PIXEL_WIDTH, PIXEL_HEIGHT);

        for(let j = 0; j < vid_x; ++j)
        {
            for(let k = 0; k < vid_y; ++k)
            {
                const sliced_out_path = "./frame_output/frame_parts/" + i + "";
                const thumb_path = sliced_out_path + "/" + k + "," + j + "thumb.jpg";
                const channel_path = sliced_out_path + "/" + k + "," + j +"channel.jpg";

                
                const timg = lodash.cloneDeep(img);
                const cimg = lodash.cloneDeep(img);
                timg.crop
                (
                    (j * (THUMBNAIL_WIDTH + HORIZONTAL_MARGIN)),
                    (k * (THUMBNAIL_HEIGHT + VERTICAL_MARGIN)),
                    THUMBNAIL_WIDTH,
                    THUMBNAIL_HEIGHT
                ).write(thumb_path);

                cimg.crop
                (
                    (j * (THUMBNAIL_WIDTH + HORIZONTAL_MARGIN)),
                    ((THUMBNAIL_HEIGHT + VERTICAL_MINOR) + ((THUMBNAIL_HEIGHT + VERTICAL_MARGIN) * k)),
                    CHANNEL_WIDTH,
                    CHANNEL_HEIGHT
                ).write(channel_path);
            }
        }
        bar.increment()
    }

    // Tell the user that it's done
    console.log("Completed!")
    process.exit()

}