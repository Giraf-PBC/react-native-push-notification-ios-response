require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-push-notification-ios-response"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = package["description"]
  s.homepage     = "https://github.com/Giraf-PBC/react-native-push-notification-ios-response"
  s.license      = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { "Giraf, PBC" => "engineering@giraf.app" }
  s.platforms    = { :ios => "10.0" }
  s.source       = { :git => "https://github.com/Giraf-PBC/react-native-push-notification-ios-response.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m}"
  s.requires_arc = true

  s.dependency "React"
end

