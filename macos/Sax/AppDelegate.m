#import "AppDelegate.h"

#import "RCTBridge.h"
#import "RCTJavaScriptLoader.h"
#import "RCTRootView.h"
#import "RCTEventDispatcher.h"
#import <Cocoa/Cocoa.h>

@interface AppDelegate() <RCTBridgeDelegate>

@end

@implementation AppDelegate

-(id)init
{
    if(self = [super init]) {
        NSRect contentSize = NSMakeRect(200, 500, 1000, 500); // initial size of main NSWindow

        self.window = [[NSWindow alloc] initWithContentRect:contentSize
                                                  styleMask:NSTitledWindowMask | NSResizableWindowMask | NSFullSizeContentViewWindowMask | NSMiniaturizableWindowMask | NSClosableWindowMask
                                                    backing:NSBackingStoreBuffered
                                                      defer:NO];
        NSWindowController *windowController = [[NSWindowController alloc] initWithWindow:self.window];

        [[self window] setTitleVisibility:NSWindowTitleHidden];
        [[self window] setAppearance:[NSAppearance appearanceNamed:NSAppearanceNameVibrantLight]];

        [windowController setShouldCascadeWindows:NO];
        [windowController setWindowFrameAutosaveName:@"Sax"];

        [windowController showWindow:self.window];

        [self setUpApplicationMenu];
      
        NSToolbar *toolbar = [[NSToolbar alloc] initWithIdentifier:@"mainToolbar"];
        [toolbar setDelegate:self];
        [toolbar setSizeMode:NSToolbarSizeModeRegular];
        
        [self.window setToolbar:toolbar];
    }
    return self;
}

- (void)applicationDidFinishLaunching:(__unused NSNotification *)aNotification
{

    _bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:nil];

    RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:_bridge
                                                     moduleName:@"Sax"
                                              initialProperties:nil];

    [self.window setContentView:rootView];
}


- (NSURL *)sourceURLForBridge:(__unused RCTBridge *)bridge
{
    NSURL *sourceURL;

#if DEBUG
    sourceURL = [NSURL URLWithString:@"http://localhost:8081/index.macos.bundle?platform=macos&dev=true"];
#else
    sourceURL = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif

    return sourceURL;
}

- (void)loadSourceForBridge:(RCTBridge *)bridge
                  withBlock:(RCTSourceLoadBlock)loadCallback
{
    [RCTJavaScriptLoader loadBundleAtURL:[self sourceURLForBridge:bridge]
                              onComplete:loadCallback];
}


- (void)setUpApplicationMenu
{
    NSMenuItem *containerItem = [[NSMenuItem alloc] init];
    NSMenu *rootMenu = [[NSMenu alloc] initWithTitle:@""];
    [containerItem setSubmenu:rootMenu];
    [rootMenu addItemWithTitle:@"Quit Sax" action:@selector(terminate:) keyEquivalent:@"q"];
  
    NSMenuItem *editItemContainer = [[NSMenuItem alloc] init];
    NSMenu *editMenu = [[NSMenu alloc] initWithTitle:@"Edit"];
    [editItemContainer setSubmenu:editMenu];
    [editMenu addItemWithTitle:@"Cut" action:@selector(cut:) keyEquivalent:@"x"];
    [editMenu addItemWithTitle:@"Copy" action:@selector(copy:) keyEquivalent:@"c"];
    [editMenu addItemWithTitle:@"Paste" action:@selector(paste:) keyEquivalent:@"v"];
    [editMenu addItem:[NSMenuItem separatorItem]];
    [editMenu addItemWithTitle:@"Select All" action:@selector(selectAll:) keyEquivalent:@"a"];
  
    [[NSApp mainMenu] addItem:containerItem];
    [[NSApp mainMenu] addItem:editItemContainer];
}

- (id)firstResponder
{
    return [self.window firstResponder];
}

- (NSArray<NSString *> *)toolbarAllowedItemIdentifiers:(NSToolbar * __unused)toolbar
{
    return @[NSToolbarFlexibleSpaceItemIdentifier, @"tabBar", NSToolbarFlexibleSpaceItemIdentifier, @"newMessageButton"];
}

- (NSArray<NSString *> *)toolbarDefaultItemIdentifiers:(NSToolbar * __unused)toolbar
{
    return @[NSToolbarFlexibleSpaceItemIdentifier, @"tabBar", NSToolbarFlexibleSpaceItemIdentifier, @"newMessageButton"];
}

- (NSToolbarItem *)toolbar:(NSToolbar *)toolbar itemForItemIdentifier:(NSString *)itemIdentifier willBeInsertedIntoToolbar:(BOOL)flag
{
    if ([itemIdentifier isEqualToString:@"tabBar"]) {
        NSSegmentedControl *field = [[NSSegmentedControl alloc] init];
        [field setFrameSize:NSMakeSize(350, field.intrinsicContentSize.height)];
      
        [field setSegmentCount:4];
        
        [field setTrackingMode:NSSegmentSwitchTrackingSelectOne];
        [field setAction:@selector(didSelectTabItem:)];
        
        [field setLabel:@"Timeline" forSegment:0];
        [field setLabel:@"Notifications" forSegment:1];
        [field setLabel:@"Local" forSegment:2];
        [field setLabel:@"Federated" forSegment:3];
      
        [field setSelectedSegment:0];
      
        NSToolbarItem *item = [[NSToolbarItem alloc] initWithItemIdentifier:itemIdentifier];
        [item setView:field];
      
        return item;
    }
  
    if ([itemIdentifier isEqualToString:@"newMessageButton"]) {
        NSButton *button = [[NSButton alloc] initWithFrame:NSMakeRect(0, 0, 50, 33)];
        [button setBezelStyle:NSRoundedBezelStyle];
        [button setImage:[NSImage imageNamed:NSImageNameAddTemplate]];
        [button setTarget:self];
        [button setAction:@selector(didPressNewMessageButton:)];
      
        NSToolbarItem *item = [[NSToolbarItem alloc] initWithItemIdentifier:itemIdentifier];
        [item setView:button];
        [item setAction:@selector(didPressNewMessageButton:)];
      
        return item;
    }
  
    return nil;
}

- (void)didPressNewMessageButton:(id)sender
{
  [_bridge.eventDispatcher
     sendDeviceEventWithName:@"onNewMessageButtonTapped"
                        body: nil
   ];
}

- (void)didSelectTabItem:(id)sender
{
    NSNumber *selectedSegment = [[NSNumber alloc] initWithInteger:[sender selectedSegment]];

    [_bridge.eventDispatcher
       sendDeviceEventWithName:@"onTabSelected"
                          body:@{@"selected": selectedSegment}
    ];
}

- (BOOL)applicationShouldTerminateAfterLastWindowClosed:(NSApplication * __unused)theApplication {
    return YES;
}

@end
