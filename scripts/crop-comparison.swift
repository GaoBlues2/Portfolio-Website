import AppKit
let args=CommandLine.arguments
let image=NSImage(contentsOfFile:args[1])!
var rect=CGRect(origin:.zero,size:image.size)
let cg=image.cgImage(forProposedRect:&rect,context:nil,hints:nil)!
let cropped=cg.cropping(to:CGRect(x:0,y:0,width:1074,height:1508))!
let rep=NSBitmapImageRep(cgImage:cropped)
try rep.representation(using:.png,properties:[:])!.write(to:URL(fileURLWithPath:args[2]))
