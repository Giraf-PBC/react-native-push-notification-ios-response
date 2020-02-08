require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-push-notification-ios-response"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-push-notification-ios-response
                   DESC
  s.homepage     = "https://github.com/Giraf-PBC/react-native-push-notification-ios-response"
  s.license      = "MIT"
  # s.license    = { :type => "MIT", :file => "FILE_LICENSE" }
  s.authors      = { "Ian Hinsdale" => "engineering@giraf.app" }
  s.platforms    = { :ios => "10.0" }
  s.source       = { :git => "https://github.com/Giraf-PBC/react-native-push-notification-ios-response.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
  # ...
  # s.dependency "..."
end

