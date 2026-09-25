import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(100);
Config.setCodec('h264');
/**
 * Bitrate, not CRF. Most of every output is the source's own footage passing
 * through a second encode; pinning at or above the source's measured bitrate
 * (audit_source.py prints it) keeps that generation loss invisible. Setting
 * both crf and videoBitrate is an error in Remotion — pick this one.
 */
Config.setVideoBitrate('15M');
Config.setAudioBitrate('320k');
Config.setOverwriteOutput(true);
